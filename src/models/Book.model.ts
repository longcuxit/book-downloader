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
  cover?: Blob;
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

  constructor(
    public info: BookInfo,
    public chapters: ChapterModel[],
    public parseChapter: (v: string) => string = String
  ) {
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
    const { href } = window.location;
    const tags = [`<a href="${href}">${href}</a>`, ...(info.tags ?? [])];
    const epub = new jEpub().init({
      ...info,
      tags: [tags.join("<br/>")],
      description: `<br/>${info.description}`,
    });

    await Promise.all(
      this.chapters.map(async ({ title, content }) => {
        content = this.parseChapter(content);
        const dom = _.stringToDom(content)!;
        await Promise.all(
          Array.from(dom.querySelectorAll("img")).map(async (img) => {
            const data = await _.downloadImage(img.src);
            if (data) {
              const id = "_" + _.hashString(img.src);
              img.replaceWith(`[img:${id}]`);
              epub.image(data, id);
            }
          })
        );
        content = _.cleanHTML(dom.outerHTML);
        content = content.replace(/\[img:(.+)\]/gi, "<%= image['$1']%>");
        epub.add(title, content);
      })
    );

    try {
      if (cover) {
        epub.cover(cover);
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
