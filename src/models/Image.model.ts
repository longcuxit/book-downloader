import { control } from "controller";
import { downloader } from "Downloader";
import { helper } from "helper";
import { NetNode, NetStatus } from "utils/NetStatus";
import { ChapterModel } from "./Chapter.model";

export type ImageData = string | Blob;

export class ImageModel extends NetNode<ChapterModel> {
  constructor(public id: string, public source: string | Blob) {
    super();
    this._stat.idle = 1;
  }

  async load() {
    if (this.source instanceof Blob) return;
    const { status } = this;
    if ([NetStatus.idle, NetStatus.error].includes(status)) {
      try {
        this.statChange(NetStatus.waiting);
        control.send({ action: "running" });
        await downloader.add(this.download);
      } catch (error: any) {
        if (error.message === "rejected") {
          this.statChange(NetStatus.idle);
        } else {
          this.statChange(NetStatus.error);
        }
      }
    }
  }

  async unload() {
    downloader.remove(this.download);
  }

  private download = async () => {
    this.statChange(NetStatus.loading);
    const data = await helper.imageToBlob(this.source as string);
    if (data instanceof Blob) {
      this.source = data;
      this.statChange(NetStatus.success);
    } else {
      throw Error();
    }
  };
}
