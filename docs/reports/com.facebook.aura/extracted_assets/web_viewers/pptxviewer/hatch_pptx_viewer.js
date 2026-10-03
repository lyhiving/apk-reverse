/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 */

(function() {
  "use strict";

  var FILL_WINDOW_WIDTH_PCT = 0.95;

  // Trailing space below the deck. The page draws edge-to-edge behind the system navigation bar, so
  // the host supplies the bar inset plus its own gap via setBottomPaddingDp. `zoom` scales padding
  // along with content, so the value is divided back out to land on the requested dp on screen.
  var bottomPaddingDp = 20;
  var appliedZoom = 1;

  function applyBottomPadding() {
    var container = document.querySelector("#document-container");
    if (container) {
      container.style.paddingBottom = bottomPaddingDp / appliedZoom + "px";
    }
  }

  window.setBottomPaddingDp = function(dp) {
    bottomPaddingDp = dp;
    applyBottomPadding();
  };

  function setZoom(zoomLevel) {
    appliedZoom = Math.max(0.1, Math.min(Number(zoomLevel), 5));
    document.body.style.zoom = appliedZoom;
    applyBottomPadding();
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
          if (result.width) {
            var scale = (window.innerWidth * FILL_WINDOW_WIDTH_PCT / result.width).toFixed(1);
            setZoom(scale);
          }
          applyBottomPadding();
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
})();
