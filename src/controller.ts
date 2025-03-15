import { EventEmitter } from "events";
import { ChapterProps } from "./models/Chapter.model";

type MessageResponse<T = any> = MessageEvent<{
  id: string;
  response: T;
}>;

const uid = (() => {
  let num = 0;
  return () => (++num).toString();
})();

class Controller extends EventEmitter {
  constructor() {
    super();

    window.addEventListener("message", ({ data, source }: MessageResponse) => {
      if (typeof data !== "object") return;
      if (source !== window && data.id) this.emit(data.id, data);
    });
  }

  send(msg: any) {
    window.parent.postMessage(msg, "*");
  }

  closeModal = () => {
    this.send("BookDownloader-close");
  };

  request<T>(action: string, request?: any) {
    const id = uid();

    return new Promise<T>((next, reject) => {
      this.once(id, ({ response, error }) => {
        if (error) reject(error);
        else next(response);
      });
      this.send({ action, id, args: request });
    });
  }

  fetch(request: Request | string) {
    return this.request<Blob>("fetch", request);
  }

  fetchChapter(props: ChapterProps) {
    return this.request<string>("fetchChapter", props);
  }

  effect(
    eventName: string | symbol,
    listener: (...args: any[]) => void
  ): () => void {
    this.on(eventName, listener);
    return () => this.off(eventName, listener);
  }
}

export const control = new Controller();
