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

// var PUBLIC_URL = "http://localhost:3000";
var bundleSrc = PUBLIC_URL + "/static/js/bundle.js";

(function () {
  "use strict";

  if (!document.querySelector("#suggest-book")) return;
  var isMobile = document.querySelector("#appMobile");
  const script = document.createElement("script");

  script.src = bundleSrc;
  document.head.appendChild(script);

  script.onload = function () {
    var _ = bookDownloaderRegister._;
    var container = document.createElement("div");
    container.className = "mr-3 w-150";
    _.query("#suggest-book").after(container);

    var textSelectors = {
      title: ".media-body h1",
      author: "a[href*=tac-gia]",
      publisher: "#nav-intro .bg-yellow-white .h4",
      description: "#nav-intro .content",
    };

    var selectors = {
      cover: "div.nh-thumb.shadow img",
      tags: _.queryAll(".media-body ul.list-unstyled.mb-4"),
      chapters: "#chapter-list .nh-section a.media",
    };

    if (isMobile) {
      container.className = "col-12";
      textSelectors.title = ".nh-section h1.h6";
      selectors.tags = _.queryAll("ul.list-unstyled", _.query(".nh-section"));

      selectors.chapters = "#chapterList a.media";
    }

    bookDownloaderRegister(container, {
      fetchData: function () {
        var info = {
          i18n: "vi",
          cover: _.getAttr(selectors.cover, "src"),
          tags: selectors.tags.map(function (ul) {
            return _.tagsFromElements(_.queryAll("li", ul));
          }),
        };

        Object.entries(textSelectors).forEach(function (entry) {
          info[entry[0]] = _.getText(entry[1]);
        });

        var getChapters = function () {
          var chapters = _.queryAll(selectors.chapters).map(function (aTag) {
            return {
              title: _.query(
                ".text-overflow-1-lines",
                aTag
              ).firstChild.textContent.trim(),
              url: aTag.href,
            };
          });
          if (chapters.length) return chapters;
        };

        if (isMobile) {
          EventBus.$emit("chapterList", {});

          getChapters = ((query) => {
            return function () {
              var chapters = query();
              if (!chapters) return;
              var li = _.query(".pagination li:last-child");
              if (!li) return chapters;
              var btn = li.firstElementChild;

              return _.asyncReduce(
                function () {
                  if (li.className.includes("disabled")) return;
                  btn.click();
                  return _.delay().then(query);
                },
                function (chapters, current) {
                  return chapters.concat(current);
                },
                chapters
              );
            };
          })(getChapters);
        } else {
          _.query("#nav-tab-chap").click();
        }

        console.log(info);
        return _.waitFor(getChapters).then(function (chapters) {
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

    if (isMobile) {
      setTimeout(() => {
        var btn = container.firstElementChild;
        btn.className = "btn btn-primary btn-md btn-block btn-shadow mt-3";
      });
    }
  };
})();
