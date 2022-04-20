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

const fakeEl = document.createElement("div");

const formatTags: Record<string, (match: string) => string> = {
  a: (match) => {
    fakeEl.innerHTML = match + "</a>";
    return `<a href="${fakeEl.querySelector("a")!.href}">`;
  },
  img: (match) => {
    fakeEl.innerHTML = match + "</a>";
    const src = fakeEl.querySelector("img")!.src;
    return `<a href="${src}">${src}</a>`;
  },
};

export class ChapterModel extends EventEmitter {
  _status = ChapterStatus.idle;
  content = "";

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
    public format: (c: string) => string
  ) {
    super();
  }

  async download(retry: number) {
    try {
      this.status = ChapterStatus.loading;

      let content = await fetch(this.url).then((res) => res.text());
      content = await Promise.resolve(this.format(content));
      this.content = _.cleanHTML(content, formatTags, ["br"]);
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
