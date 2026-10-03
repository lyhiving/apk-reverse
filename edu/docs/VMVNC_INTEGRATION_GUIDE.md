# 云端虚拟机 (VM Browser) 与 noVNC 远程桌面集成指南

Facebook Aura (Muse) 内部集成了云端虚拟工作空间/虚拟机浏览器（VM Browser）功能，通过移动端直接操作云端沙箱环境。该功能的实现核心位于 `assets/vmvnc/vnc.html`，其网络与交互设计极具工程参考价值。

---

## 1. 核心挑战与架构设计

### 1.1 痛点：WebView WebSocket 的鉴权死穴
在标准的 Web 规范中，浏览器原生 `new WebSocket(url)` API **不支持添加自定义 HTTP Request Header**（例如无法在握手阶段发送 `Authorization: Bearer <JWT>` 头）。
- 常见的妥协做法是将 Token 拼接在 URL query 参数中（例如 `wss://host/vnc?token=xxx`）。
- 但在企业级安全规范中，Token 放 URL 中极易被中间代理、网关访问日志（Access Logs）及浏览器历史记录泄露，安全性不合规。

### 1.2 Meta 的解决方案：Bridged WebSocket（原生垫片中转）

```text
┌─────────────────────────────────────────────────────────────┐
│                       WebView 前端环境                       │
│                                                             │
│   noVNC 核心库 (RFB 协议解析 & HTML5 Canvas 绘图)             │
│        ▲                                                    │
│        │ 标准 WebSocket 调用 (send / onmessage)              │
│        ▼                                                    │
│   Virtual WebSocket 垫片 (vnc.html)                          │
│   - 将二进制 ArrayBuffer 帧编码为 Base64 字符串              │
│   - 挂载到 window.AndroidVncBridge                           │
└────────┬────────────────────────────────────────────▲───────┘
         │ sendMessage(base64)                        │ onReceive(base64)
         ▼                                            │
┌─────────────────────────────────────────────────────┴───────┐
│                    Native 宿主环境 (Android/iOS)             │
│                                                             │
│   BrowserSessionController (原生控制器)                      │
│   - 使用底层网络库 (Tigon) 打开真实的 WebSocket 连接          │
│   - 在握手请求中安全注入 Header: Authorization: Bearer <JWT> │
│   - 接收远端服务端的二进制流，Base64 转发给 WebView         │
└─────────────────────────────▲───────────────────────────────┘
                              │
                              ▼ 加密网络传输
                    云端 websockify / VNC Server
```

---

## 2. 前端垫片关键实现拆解

在 `vnc.html` 中，Meta 实现了一个符合 W3C WebSocket 接口规范的虚拟类，但将其通信全部劫持并转发给原生桥梁：

```javascript
// 虚拟 WebSocket 构造函数
function BridgedWebSocket(url, protocols) {
  this.binaryType = 'arraybuffer';
  this.readyState = 0; // CONNECTING
  
  // 原生宿主通过全局 JS 方法向此实例推入接收到的数据
  window._vncSocketInstance = this;

  // 1. 发送帧拦截：ArrayBuffer -> Base64 -> 原生桥梁
  this.send = function(data) {
    if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
      var b64 = bytesToBase64(new Uint8Array(data.buffer || data));
      AndroidVncBridge.sendFrame(b64);
    }
  };

  // 2. 关闭连接拦截
  this.close = function(code, reason) {
    AndroidVncBridge.closeConnection(code, reason);
  };
}

// 原生端收到数据后调用的注入函数
window.onNativeVncFrame = function(base64Data) {
  if (window._vncSocketInstance && window._vncSocketInstance.onmessage) {
    var arrayBuffer = base64ToArrayBuffer(base64Data);
    window._vncSocketInstance.onmessage({ data: arrayBuffer });
  }
};
```

---

## 3. 跨平台复用建议

1. **若用于普通 Web 场景**：
   - 如果你的 VNC 后端（如 websockify）允许在 URL 中传递签名或一次性临时 Token，则可以直接使用标准的 noVNC 库，无需 Native 桥接。
2. **若用于移动端 App（iOS / Android）**：
   - 强烈推荐复用本套 Bridged WebSocket 方案。它既将复杂的网络连接重试、证书校验（Pinning）和 Bearer Token 管理全权交给原生网络层（如 iOS URLSessionWebSocketTask 或 Android OkHttp WebSocket），又让前端完全使用标准的 noVNC 绘制引擎。
