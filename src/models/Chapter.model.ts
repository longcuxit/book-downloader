import { control } from "../utils/controller";
import { helper } from "../utils/helpers";
import { NetNode } from "../utils/NetStatus";
import { ChapterListModel } from "./ChapterList.model";
import { ImageModel } from "./Image.model";
import { cacheDB } from "../utils/CacheDB";

export interface ChapterProps {
  title: string;
  url?: string;
  bookId?: string;
  content?: string;
}

export class ChapterModel extends NetNode<ImageModel, ChapterListModel> {
  content?: string;
  constructor(
    public props: ChapterProps,
    public image: ImageFormat,
  ) {
    super();

    if (this.props.content) {
      this.content = props.content;
      delete props.content;
      this._stat.success++;
      this.compose();
      this.processContent();
    } else {
      this.pushQuery(async () => {
        await this.getContent();
        this.processContent();
      });
    }
  }

  private async getContent() {
    const { props } = this;
    if (this.content || !props.url || !props.bookId) return;

    const chapterId = helper.hashString(props.url);
    const bookId = props.bookId;

    const rawContent = await control.fetchChapter(props);
    await cacheDB.set(chapterId, bookId, rawContent);

    return (this.content = rawContent);
  }

  private processContent() {
    if (!this.content) return;
    const dom = helper.stringToDom(this.content)!;

    if (this.image === "download") {
      const images = Array.from(dom.querySelectorAll("img")).map((img: any) => {
        const src = img.getAttribute("data-src")!;
        const id = "_" + helper.hashString(src);
        img.replaceWith(`[img:${id}]`);

        return new ImageModel(id, src);
      });
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
  }
}
