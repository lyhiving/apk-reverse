/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 */

(function() {
  "use strict";

  // Trailing space below the last row. The page draws edge-to-edge behind the system navigation
  // bar, so the host supplies the bar inset plus its own gap via setBottomPaddingDp and the last
  // row clears the bar once scrolled to the end.
  var bottomPaddingDp = 20;

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

  // A workbook large enough to blow the DOM budget is better handed to a real spreadsheet app than
  // rendered into tens of thousands of <td>s.
  var MAX_CELLS = 50000;

  // Below this relative luminance a fill is treated as dark. The community SheetJS build does not
  // expose font colour, so a cell's own white-on-navy styling is lost; without flipping the text
  // here the workbook's section bands render as black on near-black.
  var DARK_FILL_LUMINANCE = 0.5;

  // Sheets are authored far wider than a phone. Scaling the panel to fit means the sheet opens
  // whole — as it does on iOS — instead of showing an arbitrary horizontal slice that cuts rows
  // off mid-sentence. Pinch-zoom still magnifies from there.
  var FILL_WINDOW_WIDTH_PCT = 0.98;
  var MIN_FIT_ZOOM = 0.3;

  function isDarkFill(hex) {
    var r = parseInt(hex.slice(0, 2), 16) / 255;
    var g = parseInt(hex.slice(2, 4), 16) / 255;
    var b = parseInt(hex.slice(4, 6), 16) / 255;
    return 0.299 * r + 0.587 * g + 0.114 * b < DARK_FILL_LUMINANCE;
  }

  function countCells(workbook) {
    var total = 0;
    workbook.SheetNames.forEach(function(name) {
      var ref = workbook.Sheets[name] && workbook.Sheets[name]["!ref"];
      if (!ref) {
        return;
      }
      var range = XLSX.utils.decode_range(ref);
      total += (range.e.r - range.s.r + 1) * (range.e.c - range.s.c + 1);
    });
    return total;
  }

  /**
   * `sheet_to_html` handles structure — merges become colspan/rowspan, and values arrive already
   * formatted — but emits no styling whatsoever. It does tag every cell `id="sjs-<ref>"`, so the
   * fills and column widths SheetJS parsed into the sheet model can be reattached here rather than
   * hand-rolling the whole table.
   */
  function applySheetStyles(sheet, table) {
    var cols = sheet["!cols"];
    if (cols && cols.length) {
      var colgroup = document.createElement("colgroup");
      cols.forEach(function(col) {
        var el = document.createElement("col");
        if (col && col.wpx) {
          el.style.width = col.wpx + "px";
        }
        colgroup.appendChild(el);
      });
      table.insertBefore(colgroup, table.firstChild);
    }

    var cells = table.querySelectorAll("[id^='sjs-']");
    Array.prototype.forEach.call(cells, function(td) {
      var cell = sheet[td.id.slice(4)];
      var style = cell && cell.s;
      if (!style || style.patternType !== "solid" || !style.fgColor || !style.fgColor.rgb) {
        return;
      }
      // ARGB in some workbooks, RGB in others; the colour is always the trailing 6.
      var hex = style.fgColor.rgb.slice(-6);
      td.style.backgroundColor = "#" + hex;
      if (isDarkFill(hex)) {
        td.style.color = "#FFFFFF";
      }
    });
  }

  /**
   * One sheet visible at a time behind a tab strip, rather than every sheet stacked. A workbook is
   * authored as separate sheets and reads as nonsense concatenated; this also keeps the DOM cost of
   * a multi-sheet model off the initial paint path visually even though all tables are built.
   */
  function renderSheets(workbook, container) {
    var names = workbook.SheetNames;
    var panels = [];
    var tabs = [];

    function select(index) {
      panels.forEach(function(panel, i) {
        panel.style.display = i === index ? "" : "none";
      });
      tabs.forEach(function(tab, i) {
        tab.className = i === index ? "sheet-tab sheet-tab-active" : "sheet-tab";
      });
      // Measurable only once displayed, so fit and reset here rather than at build time.
      fitToWidth(panels[index]);
      panels[index].scrollLeft = 0;
    }

    if (names.length > 1) {
      var tabStrip = document.createElement("div");
      tabStrip.className = "sheet-tabs";
      names.forEach(function(name, index) {
        var tab = document.createElement("button");
        tab.className = "sheet-tab";
        tab.textContent = name;
        tab.addEventListener("click", function() {
          select(index);
        });
        tabs.push(tab);
        tabStrip.appendChild(tab);
      });
      container.appendChild(tabStrip);
    }

    names.forEach(function(name) {
      var sheet = workbook.Sheets[name];
      var panel = document.createElement("div");
      panel.className = "sheet-scroll";
      panel.innerHTML = XLSX.utils.sheet_to_html(sheet, {
        editable: false,
        header: "",
        footer: "",
      });
      var table = panel.querySelector("table");
      if (table) {
        applySheetStyles(sheet, table);
      }
      panels.push(panel);
      container.appendChild(panel);
    });

    select(0);
  }

  function fitToWidth(panel) {
    var table = panel.querySelector("table");
    if (!table) {
      return;
    }
    panel.style.zoom = "";
    var available = panel.clientWidth;
    var needed = table.scrollWidth;
    if (!available || !needed || needed <= available) {
      return;
    }
    panel.style.zoom = Math.max(
      MIN_FIT_ZOOM,
      (available * FILL_WINDOW_WIDTH_PCT) / needed
    ).toFixed(2);
  }

  function renderWorkbook(arraybuffer) {
    var container = document.querySelector("#document-container");
    try {
      // `cellStyles` populates `cell.s` with the fill records used by applySheetStyles; `cellDates`
      // keeps dates out of their serial-number representation.
      var workbook = XLSX.read(new Uint8Array(arraybuffer), {
        type: "array",
        cellStyles: true,
        cellDates: true,
      });

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        AndroidBridge.onRenderError("EMPTY_WORKBOOK");
        return;
      }

      if (countCells(workbook) > MAX_CELLS) {
        AndroidBridge.onRenderError("TOO_MANY_CELLS");
        return;
      }

      renderSheets(workbook, container);
      applyBottomPadding();
      AndroidBridge.onRenderComplete();
    } catch (e) {
      var message = (e && e.message) || "Unknown error";
      if (message.indexOf("password") !== -1 || message.indexOf("encrypted") !== -1) {
        AndroidBridge.onRenderError("PASSWORD_PROTECTED");
      } else {
        AndroidBridge.onRenderError(message);
      }
    }
  }

  window.loadFromSheetUrl = function(sheetUrl) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = "arraybuffer";
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 0) {
          renderWorkbook(xhr.response);
        } else {
          AndroidBridge.onRenderError("Failed to load file: " + xhr.statusText);
        }
      }
    };
    xhr.onerror = function() {
      AndroidBridge.onRenderError("Failed to load file");
    };
    xhr.open("GET", sheetUrl, true);
    xhr.send();
  };
})();
