import { ChapterModel, ChapterStatus } from "./models/Chapter.model";

const maxLoading = 6;
class Downloader {
  schedules: ChapterModel[] = [];
  loading = 0;
  private wakeLock?: any;

  private async progress() {
    if (!this.schedules.length) {
      await this.wakeLock?.release();
      delete this.wakeLock;
      return;
    }
    if (this.loading >= maxLoading) return;
    if ("wakeLock" in navigator && !this.wakeLock) {
      this.wakeLock = await (navigator as any).wakeLock.request("screen");
    }
    this.loading++;
    const step = this.schedules.shift()!;
    step.download(3).then(() => {
      this.loading--;
      this.progress();
    });
    this.progress();
  }

  add(chapters: ChapterModel[]) {
    if (!window.onbeforeunload) {
      window.onbeforeunload = function () {
        return "Are you sure cancel all download!...";
      };
    }
    chapters.forEach((chapter) => {
      if (
        chapter.status === ChapterStatus.idle ||
        chapter.status === ChapterStatus.error
      ) {
        chapter.status = ChapterStatus.waiting;
        this.schedules.push(chapter);
      }
    });

    this.progress();
  }

  remove(chapters: ChapterModel[]) {
    this.schedules = this.schedules.filter((chapter) => {
      if (chapters.includes(chapter)) {
        if (chapter.status === ChapterStatus.waiting) {
          chapter.status = ChapterStatus.idle;
        }
        return false;
      }
      return true;
    });
  }
}

export const downloader = new Downloader();
