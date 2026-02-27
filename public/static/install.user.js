/* eslint-disable no-undef */
// ==UserScript==
// @name         Epub downloader
// @namespace    longcuxit
// @description  Tải truyện từ các website sau đó nén thành định dạng epub.
// @version      1.1
// @author       HoangLong
// @match        https://metruyenchu.com.vn/*
// @match        https://metruyencv.com/*
// @match        https://metruyenchu.net/*
// @match        https://nettruyen.mobi/*
// @match        https://truyen.tangthuvien.vn/*
// @match        https://m.truyen.tangthuvien.vn/*
// @match        https://truyenfull.vn/*
// @match        https://wattpad.vn/*
// @match        https://dtruyen.com/*
// @connect      self
// @run-at       document-idle
// @noframes
// ==/UserScript==

(async () => {
  "use strict";
  const container = document.querySelector(".frmgoto .clearfix");
  if (!container) return;
  await import("{VITE_APP_URL}/static/client.js");

  const { render, _ } = BookDownloader;
  const button = render(document.body, {});
  button.style = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 99999999;
  `;
})();
