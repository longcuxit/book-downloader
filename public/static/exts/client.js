window.BookDownloader = ((publicUrl) => {
  publicUrl = publicUrl.split("static/")[0];
  const modalStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 9999999,
    visibility: "hidden",
  };

  const frameStyle = {
    border: "none",
  };

  let parseChapter = String;

  const batchFetch = {};

  const actions = {
    fetch: (data) => fetch(data).then((rs) => rs.blob()),
    fetchChapter: (url) => {
      const [name, index] = url.split("|");
      if (batchFetch[name]) return batchFetch[name](index).then(parseChapter);
      fetch(url)
        .then((rs) => rs.text())
        .then(parseChapter);
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

  class Modal {
    constructor(publicUrl) {
      const iframe = (this.iframe = document.createElement("iframe"));
      const modal = (this.modal = document.createElement("div"));
      modal.appendChild(iframe);
      document.body.appendChild(modal);

      iframe.src = publicUrl;
      Object.assign(iframe.style, frameStyle);
      Object.assign(modal.style, modalStyle);

      modal.addEventListener("click", this.onClick);
      iframe.onload = () => this.fitToView();

      iframe.width = "100%";
      iframe.height = "100%";

      window.addEventListener("message", ({ data }) => {
        if (data === "BookDownload-close") this.hide();
      });
    }

    onClick = (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    };

    show(data) {
      document.scrollingElement.style.overflow = "hidden";
      this.modal.style.visibility = "";
      this.iframe.contentWindow.postMessage(data, "*");
    }

    hide() {
      document.scrollingElement.style.overflow = "";
      this.modal.style.visibility = "hidden";
    }

    fitToView() {
      const { iframe } = this;
      // iframe.width = iframe.contentWindow.document.body.scrollWidth;
      // iframe.height = iframe.contentWindow.document.body.scrollHeight;
    }
  }

  const _ = {
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
      const div = document.createElement("div");
      div.innerHTML = html;
      return selector ? _.query(selector, div) : div;
    },

    getAttr(selector, attr, from = document) {
      const el = _.query(selector, from);
      return el?.[attr];
    },

    async waitFor(getter, time = 100) {
      const check = async () => {
        const result = await Promise.resolve(getter());
        if (result) return result;
        await _.delay(time);
        return check();
      };
      return check();
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

  const modal = new Modal(publicUrl);

  let num = 0;

  return {
    render(
      container,
      { fetchData, parseChapter: parse, batchChapters },
      props = {}
    ) {
      const btn = document.createElement("button");
      btn.innerHTML = `<svg focusable="false" width="1.4rem" height="1.4rem" viewBox="0 0 24 24"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" /></svg>`;
      Object.assign(btn, { type: "button" }, props);
      container.appendChild(btn);
      parseChapter = parse;

      const uid = "fetchData-" + ++num;
      actions[uid] = fetchData;
      if (batchChapters) {
        batchFetch[uid] = function (index) {};
      }
      btn.addEventListener("click", () => {
        modal.show({ id: "initialize", uid });
      });
      return btn;
    },
    _,
  };
  // eslint-disable-next-line no-undef
})(document.currentScript?.src ?? import.meta.url);
