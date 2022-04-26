/* eslint-disable no-undef */
// ==UserScript==
// @name         MeTruyenChu.com downloader
// @namespace    longcuxit
// @description  Tải truyện từ metruyenchu.com định dạng epub.
// @version      1.0
// @icon         https://metruyenchu.com/assets/images/logo.png?260324
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
    cover?: string;
    description?: string;
    tags?: string[];
  }
*/

// "https://longcuxit.github.io/book-downloader/build" = "http://localhost:3000";

(async () => {
  "use strict";
  var container = document.querySelector("#suggest-book")?.parentElement;
  if (!container) return;
  await import("https://longcuxit.github.io/book-downloader/build" + "/static/exts/client.js");

  const isMobile = document.querySelector("#appMobile");

  const { render, _ } = BookDownloader;

  const button = render(container, {
    fetchData() {
      var info = {
        i18n: "vi",
        title: _.getText(".media-body h1, .nh-section h1.h6"),
        author: _.getText("a[href*=tac-gia]"),
        publisher: _.getText("#nav-intro .bg-yellow-white .h4"),
        description: _.getText("#nav-intro .content"),

        cover: _.getAttr("div.nh-thumb.shadow img", "src"),
        tags: (isMobile
          ? _.queryAll("ul.list-unstyled", _.query(".nh-section"))
          : _.queryAll(".media-body ul.list-unstyled.mb-4")
        ).map(function (ul) {
          return _.tagsFromElements(_.queryAll("li", ul));
        }),
      };

      var getChapters = () => {
        var chapters = _.queryAll(
          "#chapter-list .nh-section a.media, #chapterList a.media"
        ).map((aTag) => {
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
          return async () => {
            let chapters = query();
            if (!chapters) return;

            const li = _.query(".pagination li:last-child");
            if (li) {
              var btn = li.firstElementChild;
              while (!li.className.includes("disabled")) {
                btn.click();
                await _.delay();
                chapters = chapters.concat(query());
              }
            }
            return chapters;
          };
        })(getChapters);
      } else {
        _.query("#nav-tab-chap").click();
      }

      console.log(info);
      return _.waitFor(getChapters).then((chapters) => {
        return { info: info, chapters: chapters };
      });
    },
    parseChapter(content) {
      const dom = _.stringToDom(content, "#js-read__content");
      _.queryAll(".pt-3.text-center", dom).forEach((div) => div.remove());
      return "<div>" + dom.innerHTML + "</div>";
    },
  });
  button.className = "btn btn-primary btn-md";
  if (isMobile) {
    button.className += " btn-block btn-shadow mt-3 mx-3";
  }
})();
