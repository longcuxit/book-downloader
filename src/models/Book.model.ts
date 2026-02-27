import { saveAs } from "file-saver";
import { helper } from "../utils/helpers";

import { ChapterModel } from "./Chapter.model";
import { ChapterListModel } from "./ChapterList.model";

export class BookModel extends ChapterListModel {
  private file: any;
  constructor(
    public info: BookInfo,
    chapters: ChapterModel[],
  ) {
    super();
    this.add(...chapters);
  }

  saving = false;

  async save() {
    if (!this.stat.success) return;
    const { cover, href, ...info } = this.info;
    this.saving = true;
    this.notify();
    if (!this.file) {
      await helper.delay(100);
      const tags = [`<a href="${href}">${href}</a>`, ...(info.tags ?? [])];
      const epub = new jEpub().init({
        ...info,
        tags: [tags.join("<br/>")],
        description: `<br/>${info.description}`,
      });
      this.children.forEach(({ props, content, children }) => {
        children.forEach(({ id, source }) => {
          if (source instanceof Blob) epub.image(source, id);
        });
        if (!content) {
          content = `Not content!!! <br/><br/><pre>${JSON.stringify(
            props,
            undefined,
            4,
          )}</pre>`;
        } else {
          content = content.replace(/\[img:(.+)\]/gi, "<%= image['$1']%>");
        }
        epub.add(props.title, content);
      });
      if (cover) epub.cover(cover);
      this.file = await epub.generate();
    }
    saveAs(this.file, `${info.title}.epub`);
    await helper.delay(500);
    this.saving = false;
    this.notify();
  }
}
