/* eslint-disable no-undef */
// ==UserScript==
// @name         Epub downloader
// @namespace    longcuxit
// @description  Tải truyện từ các website sau đó nén thành định dạng epub.
// @version      1.1
// @author       HoangLong
// @oujs:author  longcuxit
// @match        https://metruyenchu.com.vn/*
// @connect      self
// @run-at       document-idle
// @noframes
// ==/UserScript==

/**

  interface Chapter {
    title: string
    url: string
  }

  interface Info {
    i18n: string;
    title: string;
    author: string;
    publisher: string;
    cover?: string;
    description?: string;
    tags?: string[];
  }
*/

(async () => {
  "use strict";
  const container = document.querySelector(".frmgoto .clearfix");
  if (!container) return;
  await import("http://localhost:3000" + "/static/client.js");

  const { render, _ } = BookDownloader;
  const button = render(container, {});
  button.className = "btn btn-danger btn-block btn-style-1 btn-border";
})();
