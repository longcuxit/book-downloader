/* eslint-disable no-undef */
// ==UserScript==
// @name         TangThuVien.vn downloader
// @namespace    longcuxit
// @description  Tải truyện từ tangthuvien.vn định dạng epub.
// @version      1.0
// @icon         https://truyen.tangthuvien.vn/images/icon-favico.png
// @author       HoangLong
// @oujs:author  longcuxit
// @match        https://truyen.tangthuvien.vn/doc-truyen/*
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
  const container = document.querySelector("#topVoteBtn")?.parentElement;
  if (!container) return;
  await import(PUBLIC_URL + "/static/exts/client.js");

  const { render, _ } = BookDownloader;
  const button = render(container, {
    async fetchData() {
      const bookId = _.query('meta[name="book_detail"]').content;
      const info = {
        i18n: "vi",
        title: _.getText(".book-info > h1"),
        author: _.getText(".tag > a[href*=tac-gia]"),
        publisher: _.getText(".book-state li:first-child .tags"),
        description: _.getText(".book-intro > p"),
        cover: _.getAttr("#bookImg>img", "src"),
        tags: [
          _.tagsFromElements(_.queryAll(".book-info > .tag > *")),
          _.tagsFromElements(_.queryAll(".book-state li.tags .tag-wrap > *")),
        ],
      };
      const chaptersUrl = `https://truyen.tangthuvien.vn/story/chapters?story_id=${bookId}`;
      const chapters = await fetch(chaptersUrl)
        .then((rs) => rs.text())
        .then((text) => {
          const list = _.stringToDom(text, "ul");
          return _.queryAll("a", list).map((aTag) => ({
            title: aTag.innerText.trim(),
            url: aTag.href,
          }));
        });
      console.log(info, chapters);
      return { info, chapters, maxChunks: 3 };
    },
    parseChapter(content) {
      const dom = _.stringToDom(content, ".chapter-c-content");
      return "<div>" + dom.innerHTML + "</div>";
    },
  });
})();
