/* eslint-disable no-undef */
// ==UserScript==
// @name         metruyencv.com downloader
// @namespace    longcuxit
// @description  Tải truyện từ metruyencv.com định dạng epub.
// @version      1.0
// @icon         https://metruyencv.com/assets/images/logo.png?260324
// @author       HoangLong
// @oujs:author  longcuxit
// @match        http://metruyencv.com/truyen/*
// @match        https://metruyencv.com/truyen/*
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
  await import(
    "https://longcuxit.github.io/book-downloader/build" + "/static/client.js"
  );

  const isMobile = document.querySelector("#appMobile");

  const { render, _ } = BookDownloader;

  const button = render(container, {
    async fetchData() {
      var info = {
        i18n: "vi",
        title: _.getText(".media-body h1, .nh-section h1.h6"),
        author: _.getText("a[href*=tac-gia]"),
        publisher: _.getText("#nav-intro .bg-yellow-white .h4"),
        description: _.query("#nav-intro .content").outerHTML,
        cover: _.getAttr("div.nh-thumb.shadow img", "src"),
        tags: (isMobile
          ? _.queryAll("ul.list-unstyled", _.query(".nh-section"))
          : _.queryAll(".media-body ul.list-unstyled.mb-4")
        ).map(function (ul) {
          return _.tagsFromElements(_.queryAll("li", ul));
        }),
      };

      var getChapters = async () => {
        while (true) {
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
          await _.delay(100);
        }
      };

      if (isMobile) {
        EventBus.$emit("chapterList", {});

        getChapters = ((query) => {
          return async () => {
            let chapters = await query();

            const li = _.query(".pagination li:last-child");
            if (li) {
              var btn = li.firstElementChild;
              while (!li.className.includes("disabled")) {
                btn.click();
                await _.delay();
                chapters = chapters.concat(await query());
              }
            }
            return chapters;
          };
        })(getChapters);
      } else {
        _.query("#nav-tab-chap").click();
      }

      return { info: info, chapters: await getChapters(), maxChunks: 20 };
    },
    async getChapter({ url }) {
      const content = await _.fetch(url).then((rs) => rs.text());
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
