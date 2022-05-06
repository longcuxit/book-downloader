"use strict";
globalThis["webpackHotUpdatebook_downloader"]("main",{

/***/ "./src/App.tsx":
/*!*********************!*\
  !*** ./src/App.tsx ***!
  \*********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _App_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./App.css */ "./src/App.css");
/* harmony import */ var _mui_material_Box__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @mui/material/Box */ "./node_modules/@mui/material/Box/Box.js");
/* harmony import */ var _mui_material_CircularProgress__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @mui/material/CircularProgress */ "./node_modules/@mui/material/CircularProgress/CircularProgress.js");
/* harmony import */ var _mui_material_AppBar__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @mui/material/AppBar */ "./node_modules/@mui/material/AppBar/AppBar.js");
/* harmony import */ var _mui_material_Toolbar__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @mui/material/Toolbar */ "./node_modules/@mui/material/Toolbar/Toolbar.js");
/* harmony import */ var _mui_material_Typography__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @mui/material/Typography */ "./node_modules/@mui/material/Typography/Typography.js");
/* harmony import */ var _models_Chapter_model__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./models/Chapter.model */ "./src/models/Chapter.model.ts");
/* harmony import */ var _BookList__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./BookList */ "./src/BookList.tsx");
/* harmony import */ var _Infor__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Infor */ "./src/Infor.tsx");
/* harmony import */ var _helper__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./helper */ "./src/helper.ts");
/* harmony import */ var _controller__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./controller */ "./src/controller.ts");
/* harmony import */ var _Downloader__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Downloader */ "./src/Downloader.ts");
/* harmony import */ var _AsyncDialog__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./AsyncDialog */ "./src/AsyncDialog/index.ts");
/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react/jsx-dev-runtime */ "./node_modules/react/jsx-dev-runtime.js");
/* provided dependency */ var __react_refresh_utils__ = __webpack_require__(/*! ./node_modules/@pmmmwh/react-refresh-webpack-plugin/lib/runtime/RefreshUtils.js */ "./node_modules/@pmmmwh/react-refresh-webpack-plugin/lib/runtime/RefreshUtils.js");
__webpack_require__.$Refresh$.runtime = __webpack_require__(/*! ./node_modules/react-refresh/runtime.js */ "./node_modules/react-refresh/runtime.js");

var _jsxFileName = "/Volumes/DATA/Projects/book-downloader/src/App.tsx",
    _s = __webpack_require__.$Refresh$.signature();

















const cacheData = {};
console.log(chrome.extension.getBackgroundPage());

const activeTab = () => {
  return new Promise(next => {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, _ref => {
      let [tab] = _ref;
      return next(tab);
    });
  });
}; //"/static/client.js", "/static/metruyenchu.ebook.js"


const executeScript = src => {
  return new Promise(async next => {
    const {
      id
    } = await activeTab();
    chrome.scripting.executeScript({
      target: {
        tabId: id
      },
      files: [src]
    }, _ref2 => {
      let [{
        result
      }] = _ref2;
      return next(result);
    });
  });
};

activeTab().then(_ref3 => {
  let {
    id
  } = _ref3;
});

function BookDownloader() {
  _s();

  const [props, setProps] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)();
  const [image, setImage] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)();
  const confirmDialog = (0,_AsyncDialog__WEBPACK_IMPORTED_MODULE_8__.useConfirmDialog)();
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    executeScript("/static/client.js");
    return _controller__WEBPACK_IMPORTED_MODULE_6__.control.effect("initialize", async _ref4 => {
      let {
        href
      } = _ref4;
      let item = cacheData[href];
      window.focus();

      if (!item) {
        setProps(undefined);
        item = cacheData[href] = _controller__WEBPACK_IMPORTED_MODULE_6__.control.request(href);
      }

      if (item instanceof Promise) {
        var _await$helper$imageTo, _info$description;

        const data = await item;
        const {
          info,
          chapters,
          maxChunks = 5
        } = data;
        let {
          image = "link"
        } = data;
        _Downloader__WEBPACK_IMPORTED_MODULE_7__.downloader.maxChunks = maxChunks;
        let cover = (_await$helper$imageTo = await _helper__WEBPACK_IMPORTED_MODULE_5__.helper.imageToBlob(info.cover)) !== null && _await$helper$imageTo !== void 0 ? _await$helper$imageTo : undefined;
        info.description = _helper__WEBPACK_IMPORTED_MODULE_5__.helper.cleanHTML((_info$description = info.description) !== null && _info$description !== void 0 ? _info$description : "");
        item = cacheData[href] = {
          info: { ...info,
            cover,
            href: href
          },
          chapters: chapters.map((chap, index) => {
            return new _models_Chapter_model__WEBPACK_IMPORTED_MODULE_2__.ChapterModel(chap, image);
          })
        };
      }

      setProps(item);
    });
  }, [confirmDialog]);
  return /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxDEV)(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_9__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxDEV)(_mui_material_AppBar__WEBPACK_IMPORTED_MODULE_10__["default"], {
      position: "sticky",
      children: /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxDEV)(_mui_material_Toolbar__WEBPACK_IMPORTED_MODULE_11__["default"], {
        variant: "dense",
        children: /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxDEV)(_mui_material_Typography__WEBPACK_IMPORTED_MODULE_12__["default"], {
          variant: "subtitle1",
          component: "div",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          sx: {
            flexGrow: 1
          },
          children: props === null || props === void 0 ? void 0 : props.info.title
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 87,
          columnNumber: 11
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 86,
        columnNumber: 9
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 85,
      columnNumber: 7
    }, this), props ? /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxDEV)(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_9__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxDEV)(_Infor__WEBPACK_IMPORTED_MODULE_4__.Info, {
        info: props.info,
        onImage: setImage,
        image: image
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 102,
        columnNumber: 11
      }, this), /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxDEV)(_BookList__WEBPACK_IMPORTED_MODULE_3__.BookList, { ...props,
        image: image
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 103,
        columnNumber: 11
      }, this)]
    }, void 0, true) : /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxDEV)(_mui_material_Box__WEBPACK_IMPORTED_MODULE_13__["default"], {
      sx: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
      },
      children: /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxDEV)(_mui_material_CircularProgress__WEBPACK_IMPORTED_MODULE_14__["default"], {}, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 114,
        columnNumber: 11
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 106,
      columnNumber: 9
    }, this)]
  }, void 0, true);
}

_s(BookDownloader, "HzGf1C+ibfYZ9cQnssIO0Fn9/vw=", false, function () {
  return [_AsyncDialog__WEBPACK_IMPORTED_MODULE_8__.useConfirmDialog];
});

_c = BookDownloader;
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_helper__WEBPACK_IMPORTED_MODULE_5__.withContainer)(_AsyncDialog__WEBPACK_IMPORTED_MODULE_8__.AsyncDialogContainer)(BookDownloader));

var _c;

__webpack_require__.$Refresh$.register(_c, "BookDownloader");

const $ReactRefreshModuleId$ = __webpack_require__.$Refresh$.moduleId;
const $ReactRefreshCurrentExports$ = __react_refresh_utils__.getModuleExports(
	$ReactRefreshModuleId$
);

function $ReactRefreshModuleRuntime$(exports) {
	if (true) {
		let errorOverlay;
		if (true) {
			errorOverlay = false;
		}
		let testMode;
		if (typeof __react_refresh_test__ !== 'undefined') {
			testMode = __react_refresh_test__;
		}
		return __react_refresh_utils__.executeRuntime(
			exports,
			$ReactRefreshModuleId$,
			module.hot,
			errorOverlay,
			testMode
		);
	}
}

if (typeof Promise !== 'undefined' && $ReactRefreshCurrentExports$ instanceof Promise) {
	$ReactRefreshCurrentExports$.then($ReactRefreshModuleRuntime$);
} else {
	$ReactRefreshModuleRuntime$($ReactRefreshCurrentExports$);
}

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("137f892f436331aebb12")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=main.a388cbdbacb4591eb2f8.hot-update.js.map