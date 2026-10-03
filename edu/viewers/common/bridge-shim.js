/**
 * (c) 跨端通用桥接垫片 Bridge-Shim
 * 兼容 Android WebView (AndroidBridge), iOS WKWebView (window.webkit.messageHandlers) 与普通 Web 浏览器
 */
(function(window) {
  "use strict";

  // ponytail: minimal bridge shim, covers Android, iOS WKWebView, and Web CustomEvent in 30 lines
  window.AndroidBridge = window.AndroidBridge || {
    onRenderComplete: function() {
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.onRenderComplete) {
        window.webkit.messageHandlers.onRenderComplete.postMessage({});
      } else {
        window.dispatchEvent(new CustomEvent("renderComplete", { detail: { timestamp: Date.now() } }));
        console.log("[Bridge-Shim] Document Render Complete");
      }
    },
    onRenderError: function(message) {
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.onRenderError) {
        window.webkit.messageHandlers.onRenderError.postMessage({ error: message });
      } else {
        window.dispatchEvent(new CustomEvent("renderError", { detail: { error: message, timestamp: Date.now() } }));
        console.error("[Bridge-Shim] Document Render Error:", message);
      }
    }
  };

  // 跨端通知与动态内边距支持（避让底部手势条 / Safe Area Inset）
  window.setBottomPaddingDp = window.setBottomPaddingDp || function(dp) {
    var containers = document.querySelectorAll("#document-container, #screen, body");
    containers.forEach(function(el) {
      el.style.paddingBottom = dp + "px";
    });
  };

  // VM 浏览器远程桌面沙箱模拟回退 (支持无宿主独立运行)
  if (!window.AndroidVncBridge) {
    window.AndroidVncBridge = {
      socketOpen: function() {
        console.log("[Bridge-Shim] AndroidVncBridge.socketOpen simulated");
        setTimeout(function() {
          if (window.__vncBridge && window.__vncBridge.onOpen) {
            window.__vncBridge.onOpen("binary");
          }
        }, 100);
      },
      socketClose: function(code, reason) {
        console.log("[Bridge-Shim] AndroidVncBridge.socketClose", code, reason);
      },
      sendFrame: function(b64) {},
      getViewOnly: function() { return false; },
      onDisconnect: function() {}
    };
  }
})(window);
