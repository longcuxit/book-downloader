import EventEmitter from "events";

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

  async download(retry: number) {
    try {
      this.status = ChapterStatus.loading;

      this.content = await fetch(this.url).then((res) => res.text());
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
