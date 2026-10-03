/**
 * (c) PDF 预览与打印增强渲染引擎 hatch_pdf_viewer.js
 * 支持接收 ArrayBuffer 及 URL，结合移动端自适应与打印流
 */
(function() {
  "use strict";

  // ponytail: PDF.js rendering with native window.print() integration
  var pdfDoc = null;
  var bottomPaddingDp = 20;

  window.setBottomPaddingDp = function(dp) {
    bottomPaddingDp = dp;
    var container = document.querySelector("#document-container");
    if (container) container.style.paddingBottom = dp + "px";
  };

  window.printDocument = function() {
    window.print();
  };

  function renderPage(pageNum, container) {
    return pdfDoc.getPage(pageNum).then(function(page) {
      var viewport = page.getViewport({ scale: 1.5 });
      var canvas = document.createElement("canvas");
      canvas.className = "pdf-page-canvas";
      var context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      container.appendChild(canvas);

      var renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      return page.render(renderContext).promise;
    });
  }

  window.renderPdf = function(arraybuffer) {
    if (!window.pdfjsLib) {
      if (window.AndroidBridge) AndroidBridge.onRenderError("PDFJS_UNAVAILABLE");
      return;
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc = "pdf.worker.min.js";

    var loadingTask = pdfjsLib.getDocument({ data: arraybuffer });
    loadingTask.promise.then(function(pdf) {
      pdfDoc = pdf;
      var container = document.querySelector("#document-container");
      container.innerHTML = "";
      document.querySelector("#page-indicator").innerText = "Pages: " + pdf.numPages;

      var promises = [];
      for (var i = 1; i <= pdf.numPages; i++) {
        promises.push(renderPage(i, container));
      }
      Promise.all(promises).then(function() {
        container.setAttribute("data-rendered", "true");
        if (window.AndroidBridge) AndroidBridge.onRenderComplete();
      });
    }).catch(function(err) {
      if (window.AndroidBridge) AndroidBridge.onRenderError(err.message || "PDF_PARSE_FAILED");
    });
  };

  window.loadFromPdfUrl = function(pdfUrl) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = "arraybuffer";
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 0) {
          window.renderPdf(xhr.response);
        } else {
          if (window.AndroidBridge) AndroidBridge.onRenderError("Failed to load PDF: " + xhr.statusText);
        }
      }
    };
    xhr.open("GET", pdfUrl, true);
    xhr.send();
  };

  function autoInit() {
    var params = new URLSearchParams(window.location.search);
    var file = params.get("file") || "../../demo/samples/sample.pdf";
    window.loadFromPdfUrl(file);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    autoInit();
  } else {
    window.addEventListener("DOMContentLoaded", autoInit);
  }
})();
