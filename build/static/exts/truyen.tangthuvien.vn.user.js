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

// var "https://longcuxit.github.io/book-downloader/build" = "http://localhost:3000";

(async () => {
  "use strict";
  const container = document.querySelector("#topVoteBtn")?.parentElement;
  if (!container) return;
  await import("https://longcuxit.github.io/book-downloader/build" + "/static/exts/client.js");

  const { render, _ } = BookDownloader;
  const bookId = _.query('[name="story_id"]').value;

  const ids = [];
  const batchChapters = [];
  const chapFromBatch = async ({ index, loader }) => {
    return (await loader)[index].outerHTML
      .replace(/\n/gi, "<br/>")
      .replace(/—{5,}/gi, "<hr>");
  };
  const button = render(container, {
    async getChapter(index) {
      index = +index;
      const id = ids[index];
      const batch = batchChapters[index];
      if (batch) return chapFromBatch(batch);
      const loader = (async () => {
        const url = `https://truyen.tangthuvien.vn/get-4-chap?story_id=${bookId}&sort_by_ttv=${id}`;
        const rs = await fetch(url);
        const dom = _.stringToDom(await rs.text());
        return _.queryAll(".box-chap", dom);
      })();
      for (let i = 0; i < 4; i++) {
        batchChapters[index + i] = { index: i, loader };
      }
      const content = await chapFromBatch({ index: 0, loader });
      if (index === 41) {
        console.log(content);
      }
      return content;
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
          return _.queryAll("a", list).map((aTag) => {
            const match = aTag.href.match(/\/((\d+)-)?chuong-(\d+(-\d+)?)$/i);
            let id = +match[3].replace("-", ".");
            if (match[2]) ids[ids.length - 1] -= 1;
            ids.push(id);
            return { title: aTag.innerText.trim() };
          });
        });
      console.log(info, chapters, ids);
      return { info, chapters };
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
