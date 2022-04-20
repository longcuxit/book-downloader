import EventEmitter from "events";
import { ChapterModel, ChapterStatus } from "./models/Chapter.model";

const maxLoading = 6;

class Downloader extends EventEmitter {
  schedules: ChapterModel[] = [];
  loading = 0;

  private progress() {
    if (!this.schedules.length) return;
    if (this.loading >= maxLoading) return;
    this.loading++;
    const step = this.schedules.shift()!;
    step.download(3).then(() => {
      this.loading--;
      this.progress();
    });
    this.progress();
  }

  add(chapters: ChapterModel[]) {
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
