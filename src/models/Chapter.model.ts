import { LeakAddTwoTone } from "@mui/icons-material";
import EventEmitter from "events";
import { _ } from "../helper";

export enum ChapterStatus {
  idle = "idle",
  waiting = "waiting",
  loading = "loading",
  error = "error",
  success = "success",
}

export type ChapterStatusChange = {
  from: ChapterStatus;
  to: ChapterStatus;
};

export class ChapterModel extends EventEmitter {
  _status = ChapterStatus.idle;
  content = "";
  images: Record<string, Blob> = {};

  get status() {
    return this._status;
  }

  set status(status: ChapterStatus) {
    if (this._status === status) return;
    this.emit("status", { from: this._status, to: status });
    this._status = status;
  }

  constructor(
    public title: string,
    public url: string,
    public parse: (v: string) => string
  ) {
    super();
  }

  async download(retry: number) {
    try {
      this.status = ChapterStatus.loading;

      let content = await fetch(this.url).then((res) => res.text());
      content = this.parse(content);
      const dom = _.stringToDom(content)!;
      await Promise.all(
        Array.from(dom.querySelectorAll("img")).map(async (img) => {
          const data = await _.downloadImage(img.src);
          if (data) {
            const id = "_" + _.hashString(img.src);
            img.replaceWith(`[img:${id}]`);
            this.images[id] = data;
          }
        })
      );
      this.content = _.cleanHTML(dom.outerHTML);
      this.status = ChapterStatus.success;
    } catch (_) {
      if (!retry) {
        this.status = ChapterStatus.error;
        this.content = "Error!!!";
      } else {
        this.download(retry - 1);
      }
    }
  }
}
