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

  constructor(public title: string, public url: string) {
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
      this.status = ChapterStatus.idle;
    }
  }

  private download = async () => {
    try {
      this.status = ChapterStatus.loading;
      if (!this.content) {
        this.content = await control.fetchChapter(this.url);
      }
      if (!this.chunks) {
        const dom = helper.stringToDom(this.content)!;
        this.chunks = Array.from(dom.querySelectorAll("img")).map((img) => {
          const id = "_" + helper.hashString(img.src);
          img.replaceWith(`[img:${id}]`);

          const loader = async () => {
            const data = await helper.downloadImage(img.src);
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
        this.content = helper.cleanHTML(dom.outerHTML, ["a"]);
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
