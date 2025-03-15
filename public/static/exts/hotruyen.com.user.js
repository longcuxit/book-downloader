/* eslint-disable no-undef */
// ==UserScript==
// @name         hotruyen.com downloader
// @namespace    longcuxit
// @description  Tải truyện từ hotruyen.com định dạng epub.
// @version      1.0
// @icon         https://hotruyen.com/assets/images/logo.png?260324
// @author       HoangLong
// @oujs:author  longcuxit
// @match        http://hotruyen.com/truyen/*
// @match        https://hotruyen.com/truyen/*
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

PUBLIC_URL = "http://localhost:3000";

(async () => {
  "use strict";
  var container = document.querySelector("#modnav");
  if (!container) return;
  await import(PUBLIC_URL + "/static/client.js");

  const { render, _ } = BookDownloader;

  const button = render(container, {
    async fetchData() {
      var info = {
        i18n: "vi",
        title: _.getText(".dinfo a[href*=tim-truyen]"),
        author: _.getText(".dinfo a[href*=tac-gia]"),
        publisher: "",
        description: _.query("#des-info").outerHTML,
        cover: _.getAttr("#bcover img", "src"),
        tags: [],
      };

      var getChapters = async () => {
        const content = await _.fetch(
          "../muc-luc-sv/" + trTitle + "-" + bid
        ).then((rs) => rs.text());

        const dom = _.stringToDom(content, "#mlcontent");
        let children = Array.from(dom.children);
        const startIndex = children.findIndex((item) => item.id === "mlNav");
        children = children.slice(startIndex + 1, children.length - 1);

        return children.map((div) => {
          const aTag = _.query("a", div);
          return {
            title: aTag.innerText.trim(),
            url: aTag.href,
          };
        });
      };

      return { info: info, chapters: await getChapters(), maxChunks: 1 };
    },
    async getChapter({ url }) {
      const content = await _.fetch(url).then((rs) => rs.text());
      const dom = _.stringToDom(content, "#borderchapter");
      dom.children[0].remove()
      dom.children[0].remove()
      return "<div>" + dom.innerHTML + "</div>";
    },
  });
  button.className = "btn btn-primary btn-md";
})();
