import EventEmitter from "events";
import { saveAs } from "file-saver";
import { downloader } from "../Downloader";
import { _ } from "../helper";

import {
  ChapterModel,
  ChapterStatus,
  ChapterStatusChange,
} from "./Chapter.model";

export type BookChaptersStat = Record<ChapterStatus, number>;

export interface BookStatCompose {
  available: number;
  running: number;
  buffer: number;
  progress: number;
}

export interface BookInfo extends jEpubInitProps {
  cover?: string;
}

const zeroStat: BookChaptersStat = {
  idle: 0,
  waiting: 0,
  loading: 0,
  success: 0,
  error: 0,
};

export class BookModel extends EventEmitter {
  stat = { ...zeroStat };

  get composed(): BookStatCompose {
    const { stat, chapters } = this;
    const available = stat.idle + stat.error;
    const running = stat.waiting + stat.loading;
    const progress = (stat.success / chapters.length) * 100;
    const buffer = ((stat.success + stat.loading) / chapters.length) * 100;

    return { available, running, progress, buffer };
  }

  constructor(public info: BookInfo, public chapters: ChapterModel[]) {
    super();

    chapters.forEach((chapter) => {
      this.stat[chapter.status] += 1;
      chapter.on("status", this.onChapterStatus);
    });
  }

  private onChapterStatus = ({ from, to }: ChapterStatusChange) => {
    const { stat } = this;
    stat[from] -= 1;
    stat[to] += 1;
    this.emit("stat", { ...stat });
  };

  startDownload() {
    downloader.add(this.chapters);
  }

  stopDownload() {
    downloader.remove(this.chapters);
  }

  toggleDownload = () => {
    if (this.composed.running) {
      this.stopDownload();
    } else {
      this.startDownload();
    }
  };

  async save() {
    if (!this.stat.success) return;
    this.emit("saving", true);
    const { cover, ...info } = this.info;
    const epub = new jEpub().init(info);

    this.chapters.forEach((chapter) => {
      epub.add(chapter.title, chapter.content);
    });

    try {
      if (cover) {
        const buffer = await fetch(cover).then((result) =>
          result.arrayBuffer()
        );
        epub.cover(buffer);
      }
      saveAs(await epub.generate(), `${info.title}.epub`);
      await _.delay(500);
    } catch (_) {}

    this.emit("saving", false);
  }

  destroy() {
    this.chapters.forEach((chapter) => {
      chapter.off("status", this.onChapterStatus);
    });
    this.chapters.length = 0;
  }
}
