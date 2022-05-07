import { NetNode } from "utils/NetStatus";
import { ChapterModel } from "./Chapter.model";

export type ImageData = string | Blob;

export class ImageModel extends NetNode<ChapterModel> {
  constructor(public data: ImageData) {
    super();
    if (data instanceof Blob) {
      this._stat.success = 1;
    } else if (data.startsWith("data:image/")) {
      this._stat.success = 1;
    } else {
      this._stat.idle = 1;
    }
  }

  async load() {}
}
