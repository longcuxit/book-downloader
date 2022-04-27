/* eslint-disable no-undef */
// ==UserScript==
// @name         TangThuVien.vn mobile downloader
// @namespace    longcuxit
// @description  Tải truyện từ m.truyen.tangthuvien.vn định dạng epub.
// @version      1.0
// @icon         https://truyen.tangthuvien.vn/images/icon-favico.png
// @author       HoangLong
// @oujs:author  longcuxit
// @match        https://m.truyen.tangthuvien.vn/doc-truyen/*
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
  let container =
    document.querySelector("#btnReadBook")?.parentElement.parentElement;
  if (!container) return;
  await import(PUBLIC_URL + "/static/exts/client.js");

  const li = document.createElement("li");
  li.className = "btn-group-cell";
  container.append(li);
  container = li;

  const { render, _ } = BookDownloader;
  const bookId = _.query('[name="story_id"]').value;

  const button = render(container, {
    async fetchData() {
      const info = {
        i18n: "vi",
        title: _.getText(".detail > h4"),
        author: _.getText(".book-author-vv .book-title"),
        publisher: _.getText(".book-fans-cell .fans-name"),
        description: _.query(".book-introduce").outerHTML.replace(
          /\n/gi,
          "<br/>"
        ),
        cover: _.getAttr(".book-detail>img", "src"),
        tags: [
          _.tagsFromElements(
            _.queryAll(".detail > .item-author > a, .detail > .item-update")
          ),
          _.tagsFromElements(_.queryAll(".tag-list > a")),
        ],
      };
      const chaptersUrl = `https://m.truyen.tangthuvien.vn/danh-sach-chuong/${bookId}`;
      const getChapters = () =>
        fetch(chaptersUrl)
          .then((rs) => rs.text())
          .then((text) => {
            const list = _.stringToDom(
              text,
              ".body-container .chapters:last-child"
            );
            return _.queryAll("a", list).map((aTag, index) => ({
              title: aTag.innerText.trim(),
              url: `https://m.truyen.tangthuvien.vn/doc-truyen/${bookId}/chuong-${
                index + 1
              }`,
            }));
          })
          .catch(() => getChapters());
      const chapters = await getChapters();
      return { info, chapters, maxChunks: 2 };
    },
    parseChapter(content) {
      const dom = _.stringToDom(content, ".chap-c");
      content = _.queryAll(".content-block", dom)
        .map((p) => p.outerHTML)
        .join("");
      return "<div>" + content.replace(/—{5,}/gi, "<hr>") + "</div>";
    },
  });

  button.className = "btn-normal white";
  button.style.border = "none";
})();
