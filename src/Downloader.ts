import EventEmitter from "events";

export type DownloadStep = () => any;
class Downloader extends EventEmitter {
  schedules: DownloadStep[] = [];
  loading = 0;
  maxChunks = 3;

  private progress() {
    if (!this.schedules.length) return;
    if (this.loading >= this.maxChunks) return;

    this.loading++;
    const step = this.schedules.shift()!;
    this.emit("start", step);
    step().then(() => {
      this.loading--;
      this.emit("end", step);
      this.progress();
    });
    this.progress();
  }

  add(...steps: DownloadStep[]) {
    if (!window.onbeforeunload) {
      window.onbeforeunload = function () {
        return "Are you sure cancel all download!...";
      };
    }
    this.schedules.push(...steps);
    this.emit("add", steps);
    this.progress();
  }

  remove(...steps: DownloadStep[]) {
    this.schedules = this.schedules.filter((step) => !steps.includes(step));
    this.emit("remove", steps);
  }
}

export const downloader = new Downloader();
