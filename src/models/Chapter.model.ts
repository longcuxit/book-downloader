import { downloader } from "Downloader";
import { control } from "../controller";
import { helper } from "../helper";
import { NetNode, NetStatus } from "../utils/NetStatus";
import { ChapterListModel } from "./ChapterList.model";
import { ImageModel, ImageData } from "./Image.model";

export interface ChapterProps extends Record<string, any> {
  title: string;
  images?: Record<string, ImageData>;
  content?: string;
}

export class ChapterModel extends NetNode<ImageModel, ChapterListModel> {
  constructor(public props: ChapterProps, public image: ImageFormat) {
    super();

    if (props.content) {
    }

    const images = Object.values(props.images ?? {}).map(
      (data) => new ImageModel(data)
    );
    this.add(...images);
  }

  async load() {
    const { status } = this;
    if ([NetStatus.idle, NetStatus.error].includes(status)) {
      this.statChange(NetStatus.waiting, status);
      return downloader.add(this.download);
    }
  }

  async unload() {
    const { status } = this;
    if ([NetStatus.waiting, NetStatus.loading].includes(status)) {
      // if (this.chunks?.length) {
      //   downloader.remove(this.download);
      //   downloader.remove(...this.chunks);
      //   this.status = ChapterStatus.idle;
      // } else if (this.status === ChapterStatus.waiting) {
      //   downloader.remove(this.download);
      // }
    }
  }

  private download = async () => {
    const { status, props } = this;
    try {
      this.statChange(NetStatus.loading, status);
      if (!props.content) {
        props.content = await control.fetchChapter(this.props);
      }
      this.statChange(NetStatus.loading, NetStatus.success);

      // if (!this.chunks) {
      //   const dom = helper.stringToDom(this.content)!;
      //   this.chunks = [];

      //   if (this.image === "download") {
      //     this.chunks = Array.from(dom.querySelectorAll("img")).map((img) => {
      //       const src = img.getAttribute("data-src")!;
      //       const id = "_" + helper.hashString(src);
      //       img.replaceWith(`[img:${id}]`);

      //       const loader = async () => {
      //         if (this.images[id]) return;
      //         control.send({ action: "running" });
      //         const data = await helper.imageToBlob(src);
      //         if (data) {
      //           this.emit("progress", this.progress++);
      //           this.images[id] = data;
      //           if (this.chunks!.length === this.progress) {
      //             this.status = ChapterStatus.success;
      //           }
      //         }
      //       };
      //       return loader;
      //     });
      //     this.content = helper.cleanHTML(dom.outerHTML, ["a", "hr"]);
      //   } else if (this.image === "link") {
      //     Array.from(dom.querySelectorAll("img")).forEach((img) => {
      //       const src = img.getAttribute("data-src")!;
      //       const a = document.createElement("a");
      //       a.href = src;
      //       a.innerText = src;
      //       img.replaceWith(a);
      //       a.after(document.createElement("br"));
      //       img.src = src;
      //     });
      //     this.content = helper.cleanHTML(dom.outerHTML, ["a", "hr"]);
      //   } else if (this.image === "embed") {
      //     this.content = helper.cleanHTML(
      //       dom.outerHTML.replace(/ data-src=/gi, " src="),
      //       ["a", "hr", "img"]
      //     );
      //   } else {
      //     this.content = helper.cleanHTML(dom.outerHTML, ["a", "hr"]);
      //   }
      // }

      // downloader.add(...this.chunks);

      // if (this.chunks.length === 0) {
      //   this.status = ChapterStatus.success;
      // }
    } catch (_) {
      this.statChange(NetStatus.error, NetStatus.loading);
    }
  };
}
