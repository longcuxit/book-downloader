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
  function query(selector) {
    return document.querySelector(selector);
  }

  function queryAll(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function getText(selector) {
    const el = query(selector);
    return (el && el.innerText.trim()) || "";
  }

  if (!query("#suggest-book")) return;
  const script = document.createElement("script");
  script.src = "http://localhost:3000/static/js/bundle.js";
  document.head.appendChild(script);
  script.onload = function () {
    var container = document.createElement("li");
    container.className = "mr-3 w-150";
    query("#suggest-book").after(container);

    var info = {
      i18n: "en",
      title: getText(".media-body h1"),
      author: getText(".media-body .list-unstyled.mb-4 li"),
      publisher: getText("#nav-intro .bg-yellow-white .h4"),
      description: getText("#nav-intro .content"),
      tags: queryAll(".media-body .list-unstyled.mb-4 li").map(function (li) {
        return li.innerText.trim();
      }),
    };

    query("#nav-tab-chap").click();

    bookDownloaderRegister(container, {
      fetchData: function () {
        return new Promise(function (next) {
          var chapters = queryAll("#chapter-list .nh-section a").map(function (
            aTag
          ) {
            aTag.querySelector(".text-overflow-1-lines");
            return {
              title: aTag
                .querySelector(".text-overflow-1-lines")
                .firstChild.textContent.trim(),
              url: aTag.href,
            };
          });

          next(Object.assign(info, { chapters: chapters }));
        });
      },
      formatContent: function (content) {
        var div = document.createElement("div");
        div.innerHTML = content;
        div = div.querySelector("#js-read__content");

        Array.from(div.children).forEach(function (el) {
          if (el.tagName === "DIV") el.remove();
        });
        return "<div>" + div.innerHTML + "</div>";
      },
    });
  };
})();
