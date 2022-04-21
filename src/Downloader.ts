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
    const willAdd = chapters.filter((chapter) => {
      return Boolean(
        chapter.status === ChapterStatus.idle ||
          chapter.status === ChapterStatus.error
      );
    });
    willAdd.forEach((chapter) => {
      chapter.status = ChapterStatus.waiting;
      this.schedules.push(chapter);
    });

    this.progress();

    return willAdd;
  }

  remove(chapters: ChapterModel[]) {
    const willRemove = chapters.filter(
      (chapter) => chapter.status === ChapterStatus.waiting
    );
    this.schedules = this.schedules.filter((chapter) => {
      if (willRemove.includes(chapter)) {
        chapter.status = ChapterStatus.idle;
        return false;
      }
      return true;
    });
    return willRemove;
  }
}

export const downloader = new Downloader();
