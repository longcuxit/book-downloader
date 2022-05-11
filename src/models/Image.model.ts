import { helper } from "helper";
import { NetNode } from "utils/NetStatus";
import { ChapterModel } from "./Chapter.model";

export type ImageData = string | Blob;

export class ImageModel extends NetNode<ChapterModel> {
  constructor(public id: string, public source: string | Blob) {
    super();
    this.pushQuery(async () => {
      const data = await helper.imageToBlob(this.source as string);
      if (!(data instanceof Blob)) throw Error();
      this.source = data;
    });
  }
}
