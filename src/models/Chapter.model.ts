import EventEmitter from "events";
import { downloader, DownloadStep } from "../Downloader";
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

  constructor(
    public title: string,
    public url: string,
    public parse: (v: string) => string
  ) {
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
      downloader.remove(this.download);
      if (this.chunks) {
        downloader.remove(...this.chunks);
        delete this.chunks;
      }
    }
  }

  private download = async () => {
    try {
      this.status = ChapterStatus.loading;
      if (!this.content) {
        let content = await fetch(this.url).then((res) => res.text());
        this.content = this.parse(content);
      }
      if (!this.chunks) {
        const dom = _.stringToDom(this.content)!;
        this.chunks = Array.from(dom.querySelectorAll("img")).map((img) => {
          const id = "_" + _.hashString(img.src);
          img.replaceWith(`[img:${id}]`);

          const loader = async () => {
            const data = await _.downloadImage(img.src);
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
        this.content = _.cleanHTML(dom.outerHTML);
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
