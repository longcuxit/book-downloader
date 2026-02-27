import { control } from "../utils/controller";
import { helper } from "../utils/helpers";
import { NetNode } from "../utils/NetStatus";
import { ChapterListModel } from "./ChapterList.model";
import { ImageModel } from "./Image.model";

export interface ChapterProps extends Record<string, any> {
  title: string;
}

export class ChapterModel extends NetNode<ImageModel, ChapterListModel> {
  constructor(
    public props: ChapterProps,
    public image: ImageFormat,
  ) {
    super();

    this.pushQuery(async () => {
      if (this.content) return;
      this.content = await control.fetchChapter(props);

      const dom = helper.stringToDom(this.content)!;

      if (this.image === "download") {
        const images = Array.from(dom.querySelectorAll("img")).map(
          (img: any) => {
            const src = img.getAttribute("data-src")!;
            const id = "_" + helper.hashString(src);
            img.replaceWith(`[img:${id}]`);

            return new ImageModel(id, src);
          },
        );
        this.add(...images);
        this.content = helper.cleanHTML(dom.outerHTML, ["a", "hr"]);
      } else if (this.image === "link") {
        Array.from(dom.querySelectorAll("img")).forEach((img: any) => {
          const src = img.getAttribute("data-src")!;
          const a = document.createElement("a");
          a.href = src;
          a.innerText = src.split("?")[0];
          img.replaceWith(a);
          a.after(document.createElement("br"));
          img.src = src;
        });
        this.content = helper.cleanHTML(dom.outerHTML, ["a", "hr"]);
      } else if (this.image === "embed") {
        this.content = helper.cleanHTML(
          dom.outerHTML.replace(/ data-src=/gi, " src="),
          ["a", "hr", "img"],
        );
      } else {
        this.content = helper.cleanHTML(dom.outerHTML, ["a", "hr"]);
      }
    });
  }

  content?: string;
}
