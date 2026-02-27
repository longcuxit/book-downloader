window.BookDownloader = ((publicUrl) => {
  publicUrl = publicUrl.split("static/")[0];

  const wakeLock = (() => {
    let instance = false,
      timeOut;

    if (!navigator.wakeLock) return () => {};

    return () => {
      if (!instance) {
        instance = true;
        navigator.wakeLock.request("screen").then((wakeLock) => {
          instance = wakeLock;
        });
      }
      clearTimeout(timeOut);
      timeOut = setTimeout(() => {
        if (typeof instance !== "boolean") {
          instance.release();
          instance = false;
        }
      }, 5000);
    };
  })();

  const fetch = async (...args) => {
    wakeLock();
    const rs = await window.fetch(...args);
    if (!rs.ok) throw rs;
    return rs;
  };

  let fetchChapter;

  const actions = {
    fetch: (data) => fetch(data).then((rs) => rs.blob()),
    fetchChapter: async (request, retry = 2) => {
      try {
        return await fetchChapter(request);
      } catch (error) {
        if (retry && error.status >= 500) {
          return _.delay(1000).then(() =>
            actions.fetchChapter(request, retry - 1),
          );
        } else {
          throw error;
        }
      }
    },
  };
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  const getChapterList = async (doc, conf) => {
    let chapters = [];
    const script = conf.chapterListScript;
    if (script) {
      try {
        const scriptFunc = new AsyncFunction("doc", "_", script);
        const chapters = await scriptFunc(doc, _);
        return chapters;
      } catch (err) {
        console.error("Error executing chapterListScript:", err);
      }
    }

    chapters = _.queryAll(conf.chapterList, doc).map((el) => ({
      title: el.innerText.trim(),
      url: el.href,
    }));
    return chapters;
  };

  const getByConfig = async (doc, conf) => {
    const title = _.getText(conf.info.title, doc);
    const author = _.getText(conf.info.author, doc);
    const description =
      _.getText(conf.info.description, doc) ||
      _.query(conf.info.description, doc)?.innerHTML ||
      "";
    const cover =
      _.getAttr(conf.info.cover, "src", doc) ||
      _.getAttr(conf.info.cover, "data-src", doc);
    const tagsEl = _.queryAll(conf.info.tags, doc);
    const tags =
      tagsEl && tagsEl.length ? _.tagsFromElements(tagsEl).split(", ") : [];

    const chapters = await getChapterList(doc, conf);

    return {
      info: { title, author, description, cover, tags },
      chapters,
    };
  };

  window.addEventListener("message", async ({ data, source }) => {
    if (!data.action) return;
    try {
      let response;
      if (data.action === "initialize") {
        // Khởi tạo và ghi đè default action
        if (!data.args) return;
        const { config, href } = data.args;
        if (config) {
          fetchChapter = async (chapProps) => {
            const html = await fetch(chapProps.url).then((res) => res.text());
            const doc = _.stringToDom(html);
            const content = _.query(config.chapterDetail, doc);
            if (content) return content.outerHTML;
            return html;
          };
          actions[href] = () => getByConfig(document, config);
        }

        if (actions[href]) {
          response = await Promise.resolve(actions[href](data.args));
        } else {
          throw new Error("No handler for " + href);
        }
      } else {
        response = await Promise.resolve(actions[data.action](data.args));
      }
      source.postMessage({ id: data.id, response }, "*");
    } catch (error) {
      source.postMessage({ id: data.id, error: error.message }, "*");
    }
  });

  const modal = (() => {
    const { scrollingElement, body } = document;
    const iframe = document.createElement("iframe");
    const modal = document.createElement("div");
    modal.appendChild(iframe);
    body.appendChild(modal);

    iframe.src = publicUrl;
    iframe.allow = "clipboard-read; clipboard-write";
    Object.assign(iframe.style, { border: "none" });
    Object.assign(modal.style, {
      position: "fixed",
      inset: 0,
      zIndex: 9999999,
      display: "none",
    });

    iframe.width = "100%";
    iframe.height = "100%";

    function show(data) {
      scrollingElement.style.overflow = "hidden";
      Object.assign(modal.style, { display: "" });
      iframe.contentWindow.postMessage(data, "*");
    }

    function hide() {
      scrollingElement.style.overflow = "";
      Object.assign(modal.style, { display: "none" });
    }

    window.addEventListener("message", ({ data }) => {
      if (data === "BookDownloader-close") hide();
    });

    return { show, hide };
  })();

  var ownerDocument = document.implementation.createHTMLDocument("virtual");

  const _ = {
    fetch,
    query(selector, from = document) {
      return from.querySelector(selector);
    },

    queryAll(selector, from = document) {
      return Array.from(from.querySelectorAll(selector));
    },

    getText(selector, from = document) {
      const el = _.query(selector, from);
      return el?.innerText.trim() ?? "";
    },

    stringToDom(html, selector) {
      html = html.replace(/ src=/gi, " data-src=");
      const div = ownerDocument.createElement("div");
      div.innerHTML = html;
      return selector ? _.query(selector, div) : div;
    },

    getAttr(selector, attr, from = document) {
      const el = _.query(selector, from);
      return el?.[attr];
    },

    delay(time = 0, value) {
      return new Promise((next) => setTimeout(() => next(value), time));
    },

    linkFormat(link) {
      return '<a href="' + link.href + '">' + link.innerText.trim() + "</a>";
    },
    tagsFromElements(els) {
      return els
        .map((el) => {
          var text = el.innerText.trim();
          const link = el.tagName === "A" ? el : _.query("a", el);
          if (link) return _.linkFormat(link);
          return text;
        })
        .join(", ");
    },
  };

  return {
    render(container, { props = {}, href }) {
      href = href || window.location.href;
      const btn = document.createElement("button");
      btn.innerHTML = `<svg focusable="false" width="1.4rem" height="1.4rem" viewBox="0 0 24 24" fill="currentColor"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" /></svg>`;
      Object.assign(btn, { type: "button" }, props);
      container.appendChild(btn);

      btn.addEventListener("click", () =>
        modal.show({ id: "BookDownloader-open", href }),
      );
      return btn;
    },
    _,
  };
  // eslint-disable-next-line no-undef
})(document.currentScript?.src ?? import.meta.url);
