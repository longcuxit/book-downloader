/* eslint-disable no-undef */
// ==UserScript==
// @name         MeTruyenChu downloader
// @namespace    longcuxit
// @description  Tải truyện từ metruyenchu.com định dạng epub.
// @version      1.0
// @icon         https://i.imgur.com/ZOmmIGK.png
// @author       HoangLong
// @oujs:author  longcuxit
// @match        http://metruyenchu.com/truyen/*
// @match        https://metruyenchu.com/truyen/*
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
    description?: string;
    tags?: string[];
    chapters: Chapter[]
  }
*/

(function () {
  "use strict";

  if (!document.querySelector("#suggest-book")) return;
  const script = document.createElement("script");
  // script.src =
  //   "https://longcuxit.github.io/book-downloader/build/static/js/main.js";

  script.src = "http://localhost:3000/static/js/bundle.js";
  document.head.appendChild(script);

  script.onload = function () {
    var _ = bookDownloaderRegister._;
    var container = document.createElement("li");
    container.className = "mr-3 w-150";
    _.query("#suggest-book").after(container);

    var info = {
      i18n: "en",
      title: _.getText(".media-body h1"),
      author: _.getText(".media-body .list-unstyled.mb-4 li"),
      publisher: _.getText("#nav-intro .bg-yellow-white .h4"),
      description: _.getText("#nav-intro .content"),
      cover: _.getAttr(".page-content .nh-thumb img", "src"),
      tags: _.queryAll(".media-body ul.list-unstyled.mb-4").map(function (ul) {
        return _.queryAll("li", ul)
          .map(function (li) {
            return li.innerText.trim();
          })
          .join(", ");
      }),
    };

    _.query("#nav-tab-chap").click();

    bookDownloaderRegister(container, {
      fetchData: function () {
        return _.waitFor(function () {
          var chapters = _.queryAll("#chapter-list .nh-section a").map(
            function (aTag) {
              return {
                title: _.query(
                  ".text-overflow-1-lines",
                  aTag
                ).firstChild.textContent.trim(),
                url: aTag.href,
              };
            }
          );
          if (chapters.length) return chapters;
        }).then(function (chapters) {
          return { info: info, chapters: chapters };
        });
      },
      formatContent: function (content) {
        var div = document.createElement("div");
        div.innerHTML = content;
        div = _.query("#js-read__content", div);
        _.queryAll(".pt-3.text-center", div).forEach((div) => div.remove());
        return "<div>" + div.innerHTML + "</div>";
      },
    });
  };
})();
