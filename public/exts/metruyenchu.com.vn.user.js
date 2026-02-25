/* eslint-disable no-undef */
// ==UserScript==
// @name         MeTruyenChu.com.vn downloader
// @namespace    longcuxit
// @description  Tải truyện từ metruyenchu.com.vn định dạng epub.
// @version      1.0
// @icon         https://metruyenchu.com.vn/favicon/apple-icon-72x72.png
// @author       HoangLong
// @oujs:author  longcuxit
// @match        http://metruyenchu.com.vn/*
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

// var "https://longcuxit.github.io/book-downloader/build" = "http://localhost:3000";

(async () => {
  "use strict";
  const container = document.querySelector(".frmgoto .clearfix");
  if (!container) return;
  await import("http://localhost:3000" + "/static/client.js");

  const { render, _ } = BookDownloader;

  const button = render(container, {
    async fetchData() {
      const bookId = rid;
      console.log(bookId);
      const info = {
        i18n: "vi",
        title: _.getText("h1"),
        author: _.getText(".book-info-text a[href^='/tac-gia/']"),
        publisher: "",
        description: _.query(".book-info .intro")?.outerHTML || "",
        cover: _.getAttr(".book-3d img", "src"),
        tags: [
          _.tagsFromElements(
            _.queryAll(".book-info-text a[href^='/the-loai/']")
          ),
        ],
      };

      const baseUrl = window.location.origin;

      // Lấy maxPage từ pagination trên trang
      const lastPagingLink = document.querySelector('.paging a:last-child');
      const onclickAttr = lastPagingLink ? lastPagingLink.getAttribute('onclick') : null;
      const maxPageMatch = onclickAttr ? onclickAttr.match(/page\(\d+,(\d+)\)/) : null;
      const maxPage = maxPageMatch ? parseInt(maxPageMatch[1], 10) : 1;

      const chapters = [];
      let page = 1;
      while (page <= maxPage) {
        const url = `${baseUrl}/get/listchap/${bookId}?page=${page}`;
        const response = await fetch(url);
        if (!response.ok) break;

        const json = await response.json();
        if (!json.data || json.data.trim() === "" || !json.data.includes('<li')) break;

        const div = _.stringToDom(json.data);
        Array.from(div.querySelectorAll("li a")).forEach((aTag) => {
          const href = aTag.getAttribute("href");
          if (href && !href.includes("javascript")) {
            chapters.push({
              title: aTag.innerText.trim(),
              url: href.startsWith("http") ? href : baseUrl + href,
            });
          }
        });

        page++;
        await new Promise((r) => setTimeout(r, 200));
      }

      console.log(chapters);
      return { info, chapters };
    },
    async getChapter({ url }) {
      const content = await _.fetch(url).then((rs) => rs.text());
      const dom = _.stringToDom(content, ".truyen");
      const str = dom.outerHTML.replace("— QUẢNG CÁO —", "");
        console.log(str)
      if(!str) {
          throw "No Content."
      }
      return str
    },
  });

  button.className = "btn btn-danger btn-block btn-style-1 btn-border";
})();
