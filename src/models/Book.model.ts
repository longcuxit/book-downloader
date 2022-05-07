import { saveAs } from "file-saver";
import { helper } from "../helper";
import { NetNode } from "utils/NetStatus";
import { TreeNode } from "utils/TreeNode";

import { ChapterModel } from "./Chapter.model";
import { ChapterListModel } from "./ChapterList.model";

export class BookModel extends ChapterListModel {
  private file: any;
  constructor(public info: BookInfo, public chapters: ChapterModel[]) {
    super();
    this.add(...chapters);
  }

  // private onChapterProgress = () => {
  //   this.onChapterStatus({
  //     from: ChapterStatus.idle,
  //     to: ChapterStatus.idle,
  //   });
  // };
  // private onChapterStatus = ({ from, to }: ChapterStatusChange) => {
  //   const { stat } = this;
  //   this.file = null;
  //   stat[from] -= 1;
  //   stat[to] += 1;
  //   this.emit("stat", { ...stat });
  // };
  // startDownload() {
  //   this.chapters.forEach((chapter) => chapter.startDownload());
  // }
  // stopDownload() {
  //   this.chapters.forEach((chapter) => chapter.stopDownload());
  // }
  // toggleDownload = () => {
  //   if (this.composed.running) {
  //     this.stopDownload();
  //   } else {
  //     this.startDownload();
  //   }
  // };
  async save() {
    // if (!this.stat.success) return;
    // this.emit("saving", true);
    // const { cover, href, ...info } = this.info;
    // if (!this.file) {
    //   await helper.delay(100);
    //   const tags = [`<a href="${href}">${href}</a>`, ...(info.tags ?? [])];
    //   const epub = new jEpub().init({
    //     ...info,
    //     tags: [tags.join("<br/>")],
    //     description: `<br/>${info.description}`,
    //   });
    //   this.chapters.forEach(({ props, content, images }) => {
    //     Object.entries(images).forEach(([key, data]) => epub.image(data, key));
    //     if (!content) {
    //       content = `Not content!!! <br/><br/><pre>${JSON.stringify(
    //         props,
    //         undefined,
    //         4
    //       )}</pre>`;
    //     } else {
    //       content = content.replace(/\[img:(.+)\]/gi, "<%= image['$1']%>");
    //     }
    //     epub.add(props.title, content);
    //   });
    //   if (cover) epub.cover(cover);
    //   this.file = await epub.generate();
    // }
    // saveAs(this.file, `${info.title}.epub`);
    // await helper.delay(500);
    // this.emit("saving", false);
  }
  // destroy() {
  //   this.file = null;
  //   this.chapters.forEach((chapter) => {
  //     chapter.off("status", this.onChapterStatus);
  //     chapter.off("progress", this.onChapterProgress);
  //   });
  //   this.chapters.length = 0;
  // }
}
