/* eslint-disable no-undef */
// ==UserScript==
// @name         wikidth.net downloader
// @namespace    longcuxit
// @description  Tải truyện từ wikidth.net định dạng epub.
// @version      1.0
// @icon         https://wikidth.net/static/img/logo-wiki-b.gif
// @author       HoangLong
// @oujs:author  longcuxit
// @match        http://wikidth.net/truyen/*
// @match        https://wikidth.net/truyen/*
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

"https://longcuxit.github.io/book-downloader/build" = "http://localhost:3000";

(async () => {
  "use strict";
  var container = document.querySelector(".control-btns");
  if (!container) return;
  await import("https://longcuxit.github.io/book-downloader/build" + "/static/client.js");

  const { render, _ } = BookDownloader;

  const button = render(container, {
    async fetchData() {
      var info = {
        i18n: "vi",
        title: _.getText(".cover-info h2"),
        author: _.getText(".cover-info a[href*=tac-gia]"),
        publisher: _.getText(".manager-name a"),
        description: _.query(".book-desc-detail").outerHTML,
        cover: _.getAttr(".cover-wrapper img", "src"),
        tags: [_.tagsFromElements(_.queryAll(".book-desc > p > span > a"))],
      };

      var getChapters = async () => {
        const size = 500;
        let chapters = [];
        let run = true;
        while (run) {
          var url = "/book/index";
          var sign = signFunc(fuzzySign(signKey + chapters.length + size));
          await $.ajax({
            type: "GET",
            url: url,
            data: {
              bookId: bookId,
              start: chapters.length,
              size: size,
              signKey: signKey,
              sign: sign,
            },
            success: (content) => {
              const dom = _.stringToDom(content);
              const result = _.queryAll(".chapter-name a", dom).map((aTag) => ({
                title: aTag.innerText.trim(),
                url: aTag.href,
              }));
              if (result.length !== size) run = false;
              chapters = chapters.concat(result);
            },
            error: function (i, g, h) {},
          });
          await _.delay(500);
        }
        return chapters;
      };

      return { info: info, chapters: await getChapters(), maxChunks: 1 };
    },
    async getChapter({ url }) {
      const content = await _.fetch(url).then((rs) => rs.text());
      const dom = _.stringToDom(content, "#bookContentBody");
      await _.delay(500);
      return "<div>" + dom.innerHTML + "</div>";
    },
  });
  button.className = "btn waves-effect waves-light orange-btn small-btn";
  Object.assign(button.firstElementChild.style, {
    width: "19px",
    height: "36px",
    fill: "#fff",
  });
})();
