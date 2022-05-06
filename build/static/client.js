window.ebook =
  window.ebook ||
  (() => {
    fetch("https://metruyenchu.com/")
      .then((rs) => rs.text())
      .then(console.log);

    const _ = {
      query(selector, from = document) {
        return from.querySelector(selector);
      },

      queryAll(selector, from = document) {
        return Array.from(from.querySelectorAll(selector));
      },

      text(selector, from = document) {
        const el = _.query(selector, from);
        return el?.innerText.trim() ?? "";
      },

      toDom(html, selector) {
        html = html.replace(/ src=/gi, " data-src=");
        const div = document.createElement("div");
        div.innerHTML = html;
        return selector ? _.query(selector, div) : div;
      },

      delay(time = 0, value) {
        return new Promise((next) => setTimeout(() => next(value), time));
      },

      link(link) {
        return '<a href="' + link.href + '">' + link.innerText.trim() + "</a>";
      },
      tags(els) {
        return els
          .map((el) => {
            var text = el.innerText.trim();
            const link = el.tagName === "A" ? el : _.query("a", el);
            if (link) return _.link(link);
            return text;
          })
          .join(", ");
      },
    };

    const getChapters = {};

    const actions = {
      fetch: (data) => fetch(data).then((rs) => rs.blob()),
      fetchChapter: async (request, retry = 2) => {
        try {
          const content = await fetch(request.request).then((rs) => rs.text());

          return getChapters[request.bookId](content, request.request);
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

    // eslint-disable-next-line no-undef
    chrome.runtime.onConnect.addListener((port) => {
      console.log(port);
      port.onMessage.addListener(async (data, port) => {
        console.log(data, port);
        if (data.action) {
          let response;
          try {
            response = await Promise.resolve(actions[data.action](data.args));
          } catch (error) {
            response = error;
          }
          port.postMessage({ id: data.id, response });
        }
      });
    });

    // chrome.runtime.onMessage.addListener(async (data, sender, sendResponse) => {
    //   if (data.action) {
    //     let response;
    //     try {
    //       response = await Promise.resolve(actions[data.action](data.args));
    //     } catch (error) {
    //       response = error;
    //     }
    //     sendResponse(response);
    //   }
    // });

    const register = ({ getChapters, getInfo, getChapter, href }) => {
      href = href || window.location.href;
      actions[href] = async () => {
        return { info: await getInfo(), chapters: await getChapters() };
      };
      getChapters[href] = getChapter;

      return { href };
    };

    return Object.assign(register, _);
  })();
