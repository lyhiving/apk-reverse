# 全格式文档渲染器（Word/Excel/PPT/PDF）跨端实现指南

本指南详细阐述从 Facebook Aura (Muse) 提炼出的离线文档渲染方案，并结合新增补齐的 PDF 打印/渲染组件，实现一套跨 Web、iOS (WKWebView) 与 Android (WebView) 的全格式通用方案。

---

## 1. 架构原理与数据通道

### 1.1 数据传递：为什么是 ArrayBuffer？
前端渲染库（`docx-preview`、`SheetJS`、`pptxjs`、`pdf.js`）的解析核心均基于二进制解析。
在工程实现中，提供两种数据接收通道：

1. **URL 模式 (`loadFromXxxUrl(url)`)**：
   - 内部通过 `XMLHttpRequest` 设置 `xhr.responseType = "arraybuffer"` 发起异步加载。
   - 适用于能够提供远程 HTTP/HTTPS 链接，或通过 `file://` / 本地 Local Server 暴露文件的场景。
2. **直接二进制注入模式 (`renderXxx(arraybuffer)`)**：
   - 适用于 Native 层已通过原生网络库（如 OkHttp / URLSession / Tigon）下载好文件，或用户通过 Web `<input type="file">` 选择文件的场景。
   - 直接把 `ArrayBuffer`（或 Base64 转为 ArrayBuffer）传入，跳过二次网络请求。

---

## 2. 各格式查看器细节与防御式设计

### 2.1 Word 查看器 (`docxviewer`)
- **依赖库**：`docx-preview.min.js` + `jszip.min.js`
- **防御机制**：
  - **CFB 魔数拦截**：旧版 Office 二进制格式（.doc）或受密码保护的文件在头部包含 8 字节魔数 `d0cf11e0a1b11ae1`。在解析前提前检测，拦截后通知宿主转交外部应用，避免底层 JSZip 抛出晦涩的 EOF 崩溃异常。
- **排版微调**：
  - 自动检测作者设定的页面宽度（`pageWidthPt`），按视口 95% 比例动态设置 `document.body.style.zoom`，消除横向滚动条，同时保留双指缩放。

### 2.2 Excel 表格查看器 (`sheetviewer`)
- **依赖库**：`xlsx.full.min.js` (SheetJS)
- **防御机制**：
  - **大文件单元格门槛**：`MAX_CELLS = 50000`。解析前计算所有 Sheet 的总单元格数量 `(row_end - row_start + 1) * (col_end - col_start + 1)`，超过 5 万格直接中断并上报 `TOO_MANY_CELLS`，防止超大表格创建数十万 DOM 导致宿主内存溢出。
  - **多工作表适配**：自定义仿 iOS 交互样式的滚动式 Tab 导航栏。
  - **深色单元格文字对比度修正**：针对深底色单元格计算相对亮度（`Luminance < 0.5`），自动反转文本为纯白，防止黑字在深色背景上不可见。

### 2.3 PowerPoint 幻灯片查看器 (`pptxviewer`)
- **依赖库**：`pptxjs.min.js` + `d3.min.js` + `nv.d3.min.js`
- **适配机制**：支持 PPT 幻灯片矢量图形、排版及图表渲染，并计算首张幻灯片真实作者宽高比以充满屏幕宽度。

### 2.4 PDF 预览与打印增强组件 (`pdfviewer`)
针对原 APK 中依赖原生 `PdfRenderer` 的局限，我们在前端工程层补齐了全端通用的 PDF 模块：
- **预览模式**：利用现代浏览器原生的 PDF 嵌入支持或 Canvas 栅格化流式呈现。
- **打印与导出机制**：集成 `window.printDocument()`。支持触发系统级原生打印预览（在 iOS 和 Android 上可一键转存为 PDF 文件或发送至隔空打印机/本地打印服务）。

---

## 3. 跨端统一 Bridge 垫片 (`bridge-shim.js`)

Meta 原版代码硬编码了 `AndroidBridge.onRenderComplete()` 与 `AndroidBridge.onRenderError(msg)`。
为了在 **iOS (WKWebView)** 和 **普通 Web (React/Vue/H5)** 中零改动运行，我们设计了统一垫片：

```javascript
window.AndroidBridge = window.AndroidBridge || {
  onRenderComplete: function() {
    // 1. iOS WKWebView 通道
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.onRenderComplete) {
      window.webkit.messageHandlers.onRenderComplete.postMessage({ status: "success" });
    }
    // 2. 普通 Web 浏览器事件派发
    else {
      window.dispatchEvent(new CustomEvent("viewer:complete"));
    }
  },
  onRenderError: function(err) {
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.onRenderError) {
      window.webkit.messageHandlers.onRenderError.postMessage({ error: err });
    } else {
      window.dispatchEvent(new CustomEvent("viewer:error", { detail: err }));
    }
  }
};
```
无论在何种容器中运行，原生宿主只需监听对应消息，Web 端直接监听标准 DOM 事件即可。
