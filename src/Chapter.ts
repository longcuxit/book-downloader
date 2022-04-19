import EventEmitter from "events";
import { useEffect, useMemo, useState } from "react";

export enum ChapterStatus {
  idle,
  waiting,
  loading,
  error,
  success,
}

export class Chapter extends EventEmitter {
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
      const content = await fetch(this.url).then((res) => res.text());
      this.content = this.format(content);
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

const zeroStat: Record<ChapterStatus, number> = {
  [ChapterStatus.idle]: 0,
  [ChapterStatus.waiting]: 0,
  [ChapterStatus.loading]: 0,
  [ChapterStatus.success]: 0,
  [ChapterStatus.error]: 0,
};

type StatusEvent = {
  from: ChapterStatus;
  to: ChapterStatus;
};

type StatCompose = {
  available: number;
  running: number;
  buffer: number;
  progress: number;
};

export const useChaptersStat = (
  chapters: Chapter[]
): [Record<ChapterStatus, number>, StatCompose] => {
  const [chapterStat, setChapterStat] = useState(() => ({ ...zeroStat }));

  useEffect(() => {
    const stat = { ...zeroStat };
    let frameId: number = 0;

    const onStatus = ({ from, to }: StatusEvent) => {
      stat[from] -= 1;
      stat[to] += 1;
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => setChapterStat({ ...stat }));
    };

    chapters.forEach((chapter) => {
      stat[chapter.status] += 1;
      chapter.on("status", onStatus);
    });

    setChapterStat(stat);

    return () => {
      chapters.forEach((chapter) => {
        chapter.off("status", onStatus);
      });
    };
  }, [chapters]);

  const composeStat = useMemo((): StatCompose => {
    const available =
      chapterStat[ChapterStatus.idle] + chapterStat[ChapterStatus.error];
    const running =
      chapterStat[ChapterStatus.waiting] + chapterStat[ChapterStatus.loading];

    return {
      available,
      running,
      progress: (chapterStat[ChapterStatus.success] / chapters.length) * 100,
      buffer:
        ((chapterStat[ChapterStatus.success] +
          chapterStat[ChapterStatus.loading]) /
          chapters.length) *
        100,
    };
  }, [chapterStat, chapters]);

  return [chapterStat, composeStat];
};
