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
            actions.fetchChapter(request, retry - 1)
          );
        } else {
          throw error;
        }
      }
    },
  };

  window.addEventListener("message", async ({ data, source }) => {
    if (data.action) {
      let response;
      try {
        response = await Promise.resolve(actions[data.action](data.args));
      } catch (error) {
        response = error;
      }
      source.postMessage({ id: data.id, response }, "*");
    }
  });

  const modal = (() => {
    const { scrollingElement, body } = document;
    const iframe = document.createElement("iframe");
    const modal = document.createElement("div");
    modal.appendChild(iframe);
    body.appendChild(modal);

    iframe.src = publicUrl;
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
    render(container, { fetchData, getChapter, props = {}, href }) {
      href = href || window.location.href;
      const btn = document.createElement("button");
      btn.innerHTML = `<svg focusable="false" width="1.4rem" height="1.4rem" viewBox="0 0 24 24"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" /></svg>`;
      Object.assign(btn, { type: "button" }, props);
      container.appendChild(btn);

      actions[href] = fetchData;
      fetchChapter = getChapter;
      btn.addEventListener("click", () => {
        modal.show({ id: "initialize", href });
      });
      return btn;
    },
    _,
  };
  // eslint-disable-next-line no-undef
})(document.currentScript?.src ?? import.meta.url);
