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

// PUBLIC_URL = "http://localhost:3000";

(async () => {
  "use strict";
  var container = document.querySelector("#suggest-book")?.parentElement;
  if (!container) return;
  await import(PUBLIC_URL + "/static/exts/client.js");

  const isMobile = document.querySelector("#appMobile");

  const { render, _ } = BookDownloader;

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
    textSelectors.title = ".nh-section h1.h6";
    selectors.tags = _.queryAll("ul.list-unstyled", _.query(".nh-section"));
    selectors.chapters = "#chapterList a.media";
  }

  const button = render(container, {
    fetchData() {
      var info = {
        i18n: "vi",
        cover: _.getAttr(selectors.cover, "src"),
        tags: selectors.tags.map(function (ul) {
          return _.tagsFromElements(_.queryAll("li", ul));
        }),
      };

      Object.entries(textSelectors).forEach((entry) => {
        info[entry[0]] = _.getText(entry[1]);
      });

      var getChapters = () => {
        var chapters = _.queryAll(selectors.chapters).map((aTag) => {
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
