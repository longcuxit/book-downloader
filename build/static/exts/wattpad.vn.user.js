/* eslint-disable no-undef */
// ==UserScript==
// @name         wattpad.vn downloader
// @namespace    longcuxit
// @description  Tải truyện từ wattpad.vn định dạng epub.
// @version      1.0
// @icon         https://yystatic.codeprime.net/v2018/img/icon-v2018-32.png
// @author       HoangLong
// @oujs:author  longcuxit
// @match        https://wattpad.vn/*
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
  if (!document.querySelector(".story-details")) return;
  await import("https://longcuxit.github.io/book-downloader/build" + "/static/exts/client.js");

  const { render, _ } = BookDownloader;

  const container = _.query(".scover").parentElement;
  const bookId = window.location.pathname.split("/")[1];

  const button = render(container, {
    async fetchData() {
      const info = {
        i18n: "vi",
        title: _.getText("h1.title"),
        author: _.getText(".info p:nth-child(1) > a"),
        publisher: _.getText(".info p:nth-child(3) > span"),
        description: _.query(".content1 > p").outerHTML,
        cover: _.getAttr("img.scover", "src"),
        tags: [_.tagsFromElements(_.queryAll(".info p:nth-child(2) > a"))],
      };

      const countPages =
        +_.query(".pagination .nexts > a").href.split("/")[4].split("-")[1] ||
        1;

      const listChaps = await Promise.all(
        Array.from({ length: countPages }, async ($, i) => {
          const text = await fetch(
            `https://wattpad.vn/${bookId}/trang-${i + 1}/`
          ).then((rs) => rs.text());
          const dom = _.stringToDom(text, ".list-chap");
          return _.queryAll("a", dom).map((aTag) => ({
            title: aTag.innerText.trim(),
            url: aTag.href,
          }));
        })
      );

      return { info, chapters: listChaps.flat() };
    },
    getChapter(content) {
      const dom = _.stringToDom(content, ".container1 > p");
      _.queryAll("ins, script", dom).forEach((tag) => tag.remove());
      return dom.outerHTML;
    },
  });

  Object.assign(button.style, {
    display: "block",
    width: "100%",
    backgroundColor: "#ffb090",
    border: "none",
    borderRadius: "4px",
    margin: "8px auto 0",
  });
  const mButton = _.stringToDom(button.outerHTML, "button");
  _.query(".mobile .scover").parentElement.appendChild(mButton);
  mButton.onclick = () => button.click();
  mButton.style.width = "160px";
})();
