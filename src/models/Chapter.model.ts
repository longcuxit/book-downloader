import { downloader } from "Downloader";
import { control } from "../controller";
import { helper } from "../helper";
import { NetNode, NetStatus } from "../utils/NetStatus";
import { ChapterListModel } from "./ChapterList.model";
import { ImageModel } from "./Image.model";

export interface ChapterProps extends Record<string, any> {
  title: string;
}

export class ChapterModel extends NetNode<ImageModel, ChapterListModel> {
  constructor(public props: ChapterProps, public image: ImageFormat) {
    super();
    this._stat.idle = 1;
    this.compose();
  }

  content?: string;

  async load() {
    const { status } = this;
    if ([NetStatus.idle, NetStatus.error].includes(status)) {
      if (!this.content) {
        try {
          this.statChange(NetStatus.waiting, status);
          await downloader.add(this.download);
        } catch (error: any) {
          if (error.message === "rejected") {
            this.statChange(NetStatus.idle);
          } else {
            this.statChange(NetStatus.error);
          }
        }
      }
      await super.load();
    }
  }

  async unload() {
    downloader.remove(this.download);
    super.unload();
  }

  private download = async () => {
    this.statChange(NetStatus.loading);
    this.content = await control.fetchChapter(this.props);

    const dom = helper.stringToDom(this.content)!;

    if (this.image === "download") {
      const images = Array.from(dom.querySelectorAll("img")).map((img) => {
        const src = img.getAttribute("data-src")!;
        const id = "_" + helper.hashString(src);
        img.replaceWith(`[img:${id}]`);

        return new ImageModel(id, src);
      });
      this.add(...images);
      this.content = helper.cleanHTML(dom.outerHTML, ["a", "hr"]);
    } else if (this.image === "link") {
      Array.from(dom.querySelectorAll("img")).forEach((img) => {
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
        ["a", "hr", "img"]
      );
    } else {
      this.content = helper.cleanHTML(dom.outerHTML, ["a", "hr"]);
    }
    this.statChange(NetStatus.success, NetStatus.loading);
  };
}
