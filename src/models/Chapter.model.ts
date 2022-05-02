import EventEmitter from "events";
import { control } from "../controller";
import { downloader, DownloadStep } from "../Downloader";
import { helper } from "../helper";

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

export type ChapterProps = { title: string } & Record<string, any>;
export class ChapterModel extends EventEmitter {
  _status = ChapterStatus.idle;
  content?: string;
  images: Record<string, Blob> = {};
  chunks?: DownloadStep[];
  progress = 0;

  get status() {
    return this._status;
  }

  set status(status: ChapterStatus) {
    if (this._status === status) return;
    this.emit("status", { from: this._status, to: status });
    this._status = status;
  }

  constructor(public props: ChapterProps, public image: ImageFormat) {
    super();
  }

  async startDownload() {
    if ([ChapterStatus.idle, ChapterStatus.error].includes(this.status)) {
      this.status = ChapterStatus.waiting;
      return downloader.add(this.download);
    }
  }

  stopDownload() {
    if ([ChapterStatus.waiting, ChapterStatus.loading].includes(this.status)) {
      if (this.chunks?.length) {
        downloader.remove(this.download);
        downloader.remove(...this.chunks);
        this.status = ChapterStatus.idle;
      } else if (this.status === ChapterStatus.waiting) {
        downloader.remove(this.download);
      }
    }
  }

  private download = async () => {
    try {
      this.status = ChapterStatus.loading;
      if (!this.content) {
        this.content = await control.fetchChapter(this.props);
      }
      if (!this.chunks) {
        const dom = helper.stringToDom(this.content)!;
        this.chunks = [];

        if (this.image === "download") {
          this.chunks = Array.from(dom.querySelectorAll("img")).map((img) => {
            const src = img.getAttribute("data-src")!;
            const id = "_" + helper.hashString(src);
            img.replaceWith(`[img:${id}]`);

            const loader = async () => {
              if (this.images[id]) return;
              control.send({ action: "running" });
              const data = await helper.imageToBlob(src);
              if (data) {
                this.emit("progress", this.progress++);
                this.images[id] = data;
                if (this.chunks!.length === this.progress) {
                  this.status = ChapterStatus.success;
                }
              }
            };
            return loader;
          });
          this.content = helper.cleanHTML(dom.outerHTML, ["a", "hr"]);
        } else if (this.image === "link") {
          Array.from(dom.querySelectorAll("img")).forEach((img) => {
            const src = img.getAttribute("data-src")!;
            const a = document.createElement("a");
            a.href = src;
            a.innerText = src;
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
      }

      downloader.add(...this.chunks);

      if (this.chunks.length === 0) {
        this.status = ChapterStatus.success;
      }
    } catch (_) {
      this.status = ChapterStatus.error;
    }
  };
}
