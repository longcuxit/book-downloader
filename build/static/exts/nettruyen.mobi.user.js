/* eslint-disable no-undef */
// ==UserScript==
// @name         NetTruyen.mobi downloader
// @namespace    longcuxit
// @description  Tải truyện từ nettruyen.mobi định dạng epub.
// @version      1.0
// @icon         https://nettruyen.mobi/wp-content/uploads/2021/08/favicon.png
// @author       HoangLong
// @oujs:author  longcuxit
// @match        https://nettruyen.mobi/truyen-tranh/*
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

  if (!document.querySelector("#manga-detail")) return;
  await import("https://longcuxit.github.io/book-downloader/build" + "/static/js/bundle.js");

  var _ = bookDownloaderRegister._;
  var container = document.createElement("span");
  container.className = "ml-3";
  _.query("#init-links").append(container);

  bookDownloaderRegister(container, {
    async fetchData() {
      var info = {
        i18n: "vi",
        title: _.getText("#manga-detail > h1"),
        author: _.getText(".list-info .info-item:nth-child(2) a"),
        publisher: "",
        description: _.getText(".detail-content > p"),
        cover: _.getAttr(".info-image img", "src"),
        tags: [
          _.tagsFromElements(
            _.queryAll(
              ".list-info .info-item:nth-child(3) .info-content, .list-info .info-item:nth-child(4) a"
            )
          ),
        ],
      };

      const chapters = _.queryAll(".list-chapters .chapter a").map((aTag) => ({
        title: aTag.innerText.trim(),
        url: aTag.href,
      }));

      return { info, chapters: chapters.reverse() };
    },
    parseChapter(content) {
      const dom = _.stringToDom(content, ".reading-content");
      const imgs = _.queryAll("noscript", dom).map((tag) => tag.innerHTML);

      return `<div>${imgs.join("\n")}</div>`;
    },
  });
})();
