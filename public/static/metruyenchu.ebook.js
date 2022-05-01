(async () => {
  const isMobile = !!document.querySelector("#appMobile");

  const { ebook } = window;

  return ebook({
    maxChunks: 5,
    getInfo() {
      return {
        i18n: "vi",
        title: ebook.text(".media-body h1, .nh-section h1.h6"),
        author: ebook.text("a[href*=tac-gia]"),
        publisher: ebook.text("#nav-intro .bg-yellow-white .h4"),
        description: ebook.query("#nav-intro .content").outerHTML,
        cover: ebook.query("div.nh-thumb.shadow img").src,
        tags: (isMobile
          ? ebook.queryAll("ul.list-unstyled", ebook.query(".nh-section"))
          : ebook.queryAll(".media-body ul.list-unstyled.mb-4")
        ).map((ul) => ebook.tags(ebook.queryAll("li", ul))),
      };
    },

    getChapters() {
      var getChapters = async () => {
        while (true) {
          var chapters = ebook
            .queryAll("#chapter-list .nh-section a.media, #chapterList a.media")
            .map((aTag) => {
              return {
                title: ebook
                  .query(".text-overflow-1-lines", aTag)
                  .firstChild.textContent.trim(),
                url: aTag.href,
              };
            });
          if (chapters.length) return chapters;
          await ebook.delay(100);
        }
      };

      if (isMobile) {
        window.EventBus.$emit("chapterList", {});

        getChapters = ((query) => {
          return async () => {
            let chapters = await query();

            const li = ebook.query(".pagination li:last-child");
            if (li) {
              var btn = li.firstElementChild;
              while (!li.className.includes("disabled")) {
                btn.click();
                await ebook.delay();
                chapters = chapters.concat(await query());
              }
            }
            return chapters;
          };
        })(getChapters);
      } else {
        ebook.query("#nav-tab-chap").click();
      }

      return getChapters();
    },
    getChapter(content) {
      const dom = ebook.toDom(content, "#js-read__content");
      ebook.queryAll(".pt-3.text-center", dom).forEach((div) => div.remove());
      return "<div>" + dom.innerHTML + "</div>";
    },
  });
})();
