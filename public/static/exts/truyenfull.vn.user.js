/* eslint-disable no-undef */
// ==UserScript==
// @name         TruyenFull.vn downloader
// @namespace    longcuxit
// @description  Tải truyện từ truyenfull.vn định dạng epub.
// @version      1.0
// @icon         https://static.8cache.com/favicons/apple-touch-icon-57x57.png
// @author       HoangLong
// @oujs:author  longcuxit
// @match        https://truyenfull.vn/*
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
  let container = document.querySelector("#truyen .info");
  if (!container) return;
  let div = document.createElement("div");
  container.prepend(div);
  container = div;
  await import(PUBLIC_URL + "/static/client.js");

  const { render, _ } = BookDownloader;

  const button = render(container, {
    async fetchData() {
      const params = {
        tid: _.query("#truyen-id").value,
        tascii: _.query("#truyen-ascii").value,
        totalp: +_.query("#total-page").value,
      };
      const info = {
        i18n: "vi",
        title: _.getText(".title"),
        author: _.getText(".info a[href*=tac-gia]"),
        publisher: _.getText(".info > div:nth-child(3) span"),
        description: _.query(".desc-text").outerHTML,
        cover: _.getAttr(".book>img", "src"),
        tags: [],
      };

      const chapters = await Promise.all(
        Array.from({ length: params.totalp }, async ($, i) => {
          const url =
            "https://truyenfull.vn/ajax.php?type=list_chapter&" +
            Object.entries({ ...params, page: i + 1 })
              .map((e) => e.join("="))
              .join("&");

          var { chap_list } = await fetch(url).then((rs) => rs.json());
          const div = _.stringToDom(chap_list);
          return Array.from(div.querySelectorAll("a")).map((aTag) => ({
            title: aTag.innerText.trim(),
            url: aTag.href,
          }));
        })
      );

      return { info, chapters: chapters.flat() };
    },
    async getChapter({ url }) {
      const content = await _.fetch(url).then((rs) => rs.text());
      const dom = _.stringToDom(content, "#chapter-c");
      _.queryAll("div, img", dom).forEach((tag) => tag.remove());
      return dom.outerHTML;
    },
  });

  button.className = "btn btn-danger btn-block btn-style-1 btn-border";

  button.style.margin = "0 auto";

  const responsive = () => {
    if (window.innerWidth < 992) {
      container.style.margin = "0 0 10px -10px";
      button.style.maxWidth = "215px";
    } else {
      button.style.maxWidth = "auto";
      container.style.margin = "0 -5px 10px";
    }
  };
  responsive();
  window.addEventListener("resize", responsive);
})();
