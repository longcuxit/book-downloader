import EventEmitter from "events";

const maxLoading = 6;

export type DownloadStep = () => any;
class Downloader extends EventEmitter {
  schedules: DownloadStep[] = [];
  loading = 0;
  private wakeLock?: any;

  private progress() {
    if (!this.schedules.length) {
      this.wakeLock?.release().then(() => {
        delete this.wakeLock;
      });
      return;
    }
    if (this.loading >= maxLoading) return;
    if (this.loading === 0 && "wakeLock" in navigator) {
      (navigator as any).wakeLock.request("screen").then((wakeLock: any) => {
        if (!this.schedules.length) {
          wakeLock.release();
        } else {
          this.wakeLock = wakeLock;
        }
      });
    }
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
