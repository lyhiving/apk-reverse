/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 */

(function() {
  "use strict";

  var FILL_WINDOW_WIDTH_PCT = 0.95;
  var PX_TO_PT_RATIO = 0.75;

  // Trailing space below the document. The page draws edge-to-edge behind the system navigation
  // bar, so the host supplies the bar inset plus its own gap via setBottomPaddingDp and the last
  // line clears the bar once scrolled to the end. `zoom` scales padding along with content, so the
  // value is divided back out to land on the requested dp on screen.
  var bottomPaddingDp = 20;

  var appliedZoom = 1;

  function setZoom(zoomLevel) {
    appliedZoom = Math.max(0.1, Math.min(Number(zoomLevel), 5));
    document.body.style.zoom = appliedZoom;
  }

  function applyBottomPadding(container) {
    container.style.paddingBottom = bottomPaddingDp / appliedZoom + "px";
  }

  // Called by the host whenever the navigation bar inset changes, which can be before or after the
  // document finishes rendering.
  window.setBottomPaddingDp = function(dp) {
    bottomPaddingDp = dp;
    var container = document.querySelector("#document-container");
    if (container) {
      applyBottomPadding(container);
    }
  };

  // A legacy .doc is an OLE compound file, not a ZIP, and docx-preview fails on it with an opaque
  // zip error. The CFB magic identifies it up front so the caller can offer an external app.
  function checkIfLegacyOrProtected(arraybuffer) {
    var cfbHeader = "d0cf11e0a1b11ae1";
    var uint8Array = new Uint8Array(arraybuffer).slice(0, 8);
    var hex = Array.from(uint8Array)
      .map(function(byte) {
        return byte.toString(16).padStart(2, "0");
      })
      .join("");
    if (hex.startsWith(cfbHeader)) {
      throw new Error("LEGACY_OR_PASSWORD_PROTECTED");
    }
  }

  function renderDocx(arraybuffer) {
    var container = document.querySelector("#document-container");
    try {
      checkIfLegacyOrProtected(arraybuffer);
    } catch (e) {
      AndroidBridge.onRenderError(e.message || "Unknown error");
      return;
    }
    docx
      .parseAsync(arraybuffer)
      .then(function(parsed) {
        // Scale the authored page width down to the viewport so the document is readable without
        // a horizontal scroll on first paint; pinch-zoom still works from there.
        var pageWidthPt = parseFloat(
          parsed &&
            parsed.documentPart &&
            parsed.documentPart.body &&
            parsed.documentPart.body.props &&
            parsed.documentPart.body.props.pageSize &&
            parsed.documentPart.body.props.pageSize.width
        );
        if (pageWidthPt) {
          var windowWidthPt = window.innerWidth * PX_TO_PT_RATIO;
          setZoom(((windowWidthPt * FILL_WINDOW_WIDTH_PCT) / pageWidthPt).toFixed(1));
        }
        return docx.renderDocument(parsed, container);
      })
      .then(function() {
        if (!container.textContent.trim() && !container.querySelector("img")) {
          AndroidBridge.onRenderError("EMPTY_DOCUMENT");
          return;
        }
        applyBottomPadding(container);
        AndroidBridge.onRenderComplete();
      })
      .catch(function(error) {
        var message = (error && error.message) || "Unknown error";
        if (message.indexOf("Can't find end of central directory") === 0) {
          AndroidBridge.onRenderError("DAMAGED_OR_CORRUPTED");
        } else {
          AndroidBridge.onRenderError(message);
        }
      });
  }

  window.loadFromDocxUrl = function(docxUrl) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = "arraybuffer";
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 0) {
          renderDocx(xhr.response);
        } else {
          AndroidBridge.onRenderError("Failed to load file: " + xhr.statusText);
        }
      }
    };
    xhr.onerror = function() {
      AndroidBridge.onRenderError("Failed to load file");
    };
    xhr.open("GET", docxUrl, true);
    xhr.send();
  };
})();
