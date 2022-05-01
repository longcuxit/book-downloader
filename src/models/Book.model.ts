import EventEmitter from "events";
import { saveAs } from "file-saver";
import { helper } from "../helper";

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
  href: string;
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

    const totalProgress =
      chapters.length +
      chapters.reduce((count, chapter) => {
        return count + (chapter.chunks?.length ?? 0);
      }, 0);
    const totalSuccess =
      stat.success +
      chapters.reduce((count, chapter) => {
        return count + chapter.progress;
      }, 0);

    const progress = (totalSuccess / totalProgress) * 100;
    const buffer = ((totalSuccess + stat.loading) / totalProgress) * 100;

    return { available, running, progress, buffer };
  }

  private file: any;

  constructor(public info: BookInfo, public chapters: ChapterModel[]) {
    super();

    chapters.forEach((chapter) => {
      this.stat[chapter.status] += 1;
      chapter.on("status", this.onChapterStatus);
      chapter.on("progress", this.onChapterProgress);
    });
  }

  private onChapterProgress = () => {
    this.onChapterStatus({
      from: ChapterStatus.idle,
      to: ChapterStatus.idle,
    });
  };

  private onChapterStatus = ({ from, to }: ChapterStatusChange) => {
    const { stat } = this;
    this.file = null;
    stat[from] -= 1;
    stat[to] += 1;
    this.emit("stat", { ...stat });
  };

  startDownload() {
    this.chapters.forEach((chapter) => chapter.startDownload());
  }

  stopDownload() {
    this.chapters.forEach((chapter) => chapter.stopDownload());
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
    const { cover, href, ...info } = this.info;

    if (!this.file) {
      await helper.delay(100);
      const tags = [`<a href="${href}">${href}</a>`, ...(info.tags ?? [])];
      const epub = new jEpub().init({
        ...info,
        tags: [tags.join("<br/>")],
        description: `<br/>${info.description}`,
      });

      await Promise.all(
        this.chapters.map(async ({ props, content, images }) => {
          Object.entries(images).forEach(([key, data]) =>
            epub.image(data, key)
          );
          if (!content) {
            content = `Not content!!! <br/><br/><pre>${JSON.stringify(
              props,
              undefined,
              4
            )}</pre>`;
          } else {
            content = content.replace(/\[img:(.+)\]/gi, "<%= image['$1']%>");
          }
          epub.add(props.title, content);
        })
      );

      if (cover) epub.cover(cover);
      this.file = await epub.generate();
    }

    saveAs(this.file, `${info.title}.epub`);
    await helper.delay(500);
    this.emit("saving", false);
  }

  destroy() {
    this.file = null;
    this.chapters.forEach((chapter) => {
      chapter.off("status", this.onChapterStatus);
      chapter.off("progress", this.onChapterProgress);
    });
    this.chapters.length = 0;
  }
}
