/* eslint-disable no-undef */
// ==UserScript==
// @name         dtruyen.com downloader
// @namespace    longcuxit
// @description  Tải truyện từ dtruyen.com định dạng epub.
// @version      1.0
// @icon         https://img.dtruyen.com/logo-dtruyen.png
// @author       HoangLong
// @oujs:author  longcuxit
// @match        https://dtruyen.com/*
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

// var PUBLIC_URL = "http://localhost:3000";

(async () => {
  "use strict";
  const container = document.querySelector("#story-detail .actions");
  if (!container) return;
  await import(PUBLIC_URL + "/static/exts/client.js");

  const { render, _ } = BookDownloader;

  const bookId = window.location.pathname.split("/")[1];

  const button = render(container, {
    async fetchData() {
      const info = {
        i18n: "vi",
        title: _.getText("h1.title"),
        author: _.getText(".infos .author a"),
        publisher: _.getText(".infos p:nth-child(3) a"),
        description: _.query(".description").outerHTML,
        cover: _.getAttr(".thumb img.cover", "src"),
        tags: [_.tagsFromElements(_.queryAll(".infos .story_categories a"))],
      };

      const totalPages = +_.query("#goto-page").dataset.total;
      const chapters = [];
      for (let i = 0; i < totalPages; i++) {
        const pageNum = i ? i + 1 + "/" : "";
        try {
          const rs = await _.fetch(`https://dtruyen.com/${bookId}/${pageNum}`);
          const dom = _.stringToDom(await rs.text(), "#chapters .chapters");
          _.queryAll("a", dom).forEach((aTag) => {
            chapters.push({
              title: aTag.innerText.trim(),
              url: aTag.href,
            });
          });
        } catch ($) {
          await _.delay(1000);
          i--;
        }
      }
      console.log(info, chapters);
      return { info, chapters, maxChunks: 1 };
    },
    async getChapter(content) {
      const dom = _.stringToDom(content, "#chapter-content");
      return dom.outerHTML;
    },
  });

  Object.assign(button.style, {
    backgroundColor: "#e91b0c",
    border: "none",
    margin: "10px auto",
    display: "block",
    width: "170px",
    padding: "8px 16px",
    cursor: "pointer",
  });
})();
