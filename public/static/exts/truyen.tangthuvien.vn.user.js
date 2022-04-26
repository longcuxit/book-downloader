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
  const bookId = _.query('[name="story_id"]').value;

  const batchChapters = [];
  const chapFromBatch = async ({ index, loader }) => {
    return (await loader)[index].outerHTML;
  };
  const button = render(container, {
    async batchChapters(index) {
      const batch = batchChapters[index];
      if (batch) return chapFromBatch(batch);
      const loader = fetch(
        `https://truyen.tangthuvien.vn/get-4-chap?story_id=${bookId}&sort_by_ttv=${
          index + 1
        }`
      )
        .then((rs) => rs.text())
        .then((text) => {
          const dom = _.stringToDom(text);
          return _.queryAll(".box-chap", dom);
        });
      for (let i = 0; i < 4; i++) {
        batchChapters[index + i] = { index: i, loader };
      }
      return chapFromBatch({ index: 0, loader });
    },
    async fetchData() {
      const info = {
        i18n: "vi",
        title: _.getText(".book-info > h1"),
        author: _.getText(".tag > a[href*=tac-gia]"),
        publisher: _.getText(".book-state li:first-child .tags"),
        description: _.query(".book-intro > p").outerHTML,
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
      return { info, chapters };
    },
    parseChapter(content) {
      return content.replace(/\n/gi, "<br/>").replace(/—{5,}/gi, "<hr>");
    },
  });

  button.className = "blue-btn";
  Object.assign(button.style, {
    marginRight: "-36px",
    borderWidth: "1px",
    transform: "translateY(9px)",
    width: "36px",
    height: "35px",
    cursor: "pointer",
  });
})();
