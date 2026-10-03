/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 */

(function() {
  "use strict";

  var FILL_WINDOW_WIDTH_PCT = 0.95;
  var bottomPaddingDp = 20;
  var userZoom = 1.0;

  function applyBottomPadding() {
    var container = document.querySelector("#document-container");
    if (container) {
      container.style.paddingBottom = bottomPaddingDp + "px";
    }
  }

  window.setBottomPaddingDp = function(dp) {
    bottomPaddingDp = dp;
    applyBottomPadding();
  };

  function layoutSlides() {
    var slides = document.querySelectorAll(".slide");
    if (!slides || slides.length === 0) return;

    // 获取视口真实可用宽度（兼容移动端 visualViewport）
    var viewportWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    viewportWidth = Math.min(viewportWidth, document.documentElement.clientWidth || viewportWidth);

    var targetWidth = viewportWidth * FILL_WINDOW_WIDTH_PCT;

    slides.forEach(function(slide) {
      // 记录幻灯片原始宽高
      var origW = parseFloat(slide.getAttribute("data-orig-width"));
      var origH = parseFloat(slide.getAttribute("data-orig-height"));
      if (!origW || !origH) {
        origW = parseFloat(slide.style.width) || slide.offsetWidth || 1280;
        origH = parseFloat(slide.style.height) || slide.offsetHeight || 720;
        slide.setAttribute("data-orig-width", origW);
        slide.setAttribute("data-orig-height", origH);
      }

      var baseScale = targetWidth / origW;
      var currentScale = baseScale * userZoom;
      var scaledH = origH * currentScale;

      // 包裹防溢出与等比占位容器
      var parent = slide.parentElement;
      if (!parent.classList.contains("slide-scale-container")) {
        var container = document.createElement("div");
        container.className = "slide-scale-container";
        parent.insertBefore(container, slide);
        container.appendChild(slide);
      }

      var wrapper = slide.parentElement;
      wrapper.style.width = "100%";
      wrapper.style.height = scaledH + "px";
      wrapper.style.display = "flex";
      wrapper.style.justifyContent = "center";
      wrapper.style.alignItems = "flex-start";
      wrapper.style.overflow = "hidden";
      wrapper.style.marginBottom = "16px";

      slide.style.transformOrigin = "top center";
      slide.style.transform = "scale(" + currentScale + ")";
      slide.style.margin = "0";
      slide.style.flexShrink = "0";
      slide.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.1)";
      slide.style.borderRadius = "8px";
    });
  }

  window.setZoom = function(zoomLevel) {
    userZoom = Math.max(0.2, Math.min(Number(zoomLevel), 5));
    layoutSlides();
  };

  window.addEventListener("resize", function() {
    layoutSlides();
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", function() {
      layoutSlides();
    });
  }

  function hackyCheckIfPasswordProtected(arraybuffer) {
    var cfbHeader = "d0cf11e0a1b11ae1";
    var uint8Array = new Uint8Array(arraybuffer).slice(0, 8);
    var hex = Array.from(uint8Array)
      .map(function(byte) {
        return byte.toString(16).padStart(2, "0");
      })
      .join("");
    if (hex.startsWith(cfbHeader)) {
      throw new Error("PASSWORD_PROTECTED");
    }
  }

  function renderPptx(arraybuffer) {
    try {
      hackyCheckIfPasswordProtected(arraybuffer);
      pptxToHtml({
        divId: "document-container",
        fileContent: arraybuffer,
        onComplete: function(result) {
          if (result.numOfSlides === 0) {
            AndroidBridge.onRenderError("EMPTY_POWERPOINT");
            return;
          }
          // 重新整理幻灯片布局，自适应视口宽度并消除横向溢出
          layoutSlides();
          applyBottomPadding();
          var container = document.querySelector("#document-container");
          if (container) container.setAttribute("data-rendered", "true");
          AndroidBridge.onRenderComplete();
        },
        onError: function(error) {
          if (error.message && error.message.startsWith("Corrupted zip")) {
            AndroidBridge.onRenderError("DAMAGED_OR_CORRUPTED");
          } else {
            AndroidBridge.onRenderError(error.message || "Unknown error");
          }
        },
        errorIfEmpty: true,
      });
    } catch (e) {
      AndroidBridge.onRenderError(e.message || "Unknown error");
    }
  }

  window.loadFromPptxUrl = function(pptxUrl) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = "arraybuffer";
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 0) {
          renderPptx(xhr.response);
        } else {
          AndroidBridge.onRenderError("Failed to load file: " + xhr.statusText);
        }
      }
    };
    xhr.onerror = function() {
      AndroidBridge.onRenderError("Failed to load file");
    };
    xhr.open("GET", pptxUrl, true);
    xhr.send();
  };

  window.addEventListener("DOMContentLoaded", function() {
    var params = new URLSearchParams(window.location.search);
    var file = params.get("file") || "../../demo/samples/sample.pptx";
    window.loadFromPptxUrl(file);
  });
})();
