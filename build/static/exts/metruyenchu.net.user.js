/* eslint-disable no-undef */
// ==UserScript==
// @name         MeTruyenChu.net downloader
// @namespace    longcuxit
// @description  Tải truyện từ metruyenchu.net định dạng epub.
// @version      1.0
// @icon         https://metruyenchu.net/favicon/apple-icon-72x72.png
// @author       HoangLong
// @oujs:author  longcuxit
// @match        http://metruyenchu.net/*
// @match        https://metruyenchu.net/*
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

  if (!document.querySelector("#latestChapter")) return;

  await import("https://longcuxit.github.io/book-downloader/build" + "/static/js/bundle.js");

  const { render, _ } = BookDownloader;
  const container = document.createElement("div");
  container.className = "mr-3 w-150";
  _.query("#latestChapter").after(container);

  render(container, {
    async fetchData() {
      const bookId = _.query("#truyen-id").value;
      const info = {
        i18n: "vi",
        title: _.getText(".story-title"),
        author: _.getText(".info a[href*=tac-gia]"),
        publisher: "",
        description: _.getText(".desc-text"),
        cover: _.getAttr(".col-info-desc .book>img", "src"),
        tags: [
          _.tagsFromElements(
            _.queryAll(
              ".info [itemprop='genre'],.info .text-primary,.info .source"
            )
          ),
        ],
      };

      function getTotalPages() {
        var lastPage = _.query(".pagination li:last-child");
        if (!lastPage) return 1;
        var url = _.getAttr("a", "href", lastPage);
        return +url.split("=")[1];
      }

      var div = document.createElement("div");
      var chapters = await Promise.all(
        Array.from({ length: getTotalPages() }, async (_, i) => {
          var url = "https://metruyenchu.net/api/services/list-chapter?";
          url += ["type=list_chapter", "tid=" + bookId, "page=" + (i + 1)].join(
            "&"
          );

          var { chap_list } = await fetch(url).then((rs) => rs.json());
          div.innerHTML = chap_list;
          return Array.from(div.querySelectorAll("a")).map((aTag) => ({
            title: aTag.innerText.trim(),
            url: aTag.href,
          }));
        })
      ).then((list) => list.flat());
      return { info, chapters };
    },
    parseChapter(content) {
      const dom = _.stringToDom(content, "#chapter-c");
      return "<div>" + dom.innerHTML.replace("— QUẢNG CÁO —", "") + "</div>";
    },
  });
})();
