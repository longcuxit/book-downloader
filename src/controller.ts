import { ChapterProps } from "./models/Chapter.model";

class EventEmitter {
  private _listeners: Record<string, ((...args: any[]) => void)[]> = {};

  on(event: string | symbol, listener: (...args: any[]) => void) {
    const key = String(event);
    (this._listeners[key] ??= []).push(listener);
    return this;
  }

  off(event: string | symbol, listener: (...args: any[]) => void) {
    const key = String(event);
    const arr = this._listeners[key];
    if (arr) this._listeners[key] = arr.filter((l) => l !== listener);
    return this;
  }

  once(event: string | symbol, listener: (...args: any[]) => void) {
    const wrapper = (...args: any[]) => {
      this.off(event, wrapper);
      listener(...args);
    };
    return this.on(event, wrapper);
  }

  emit(event: string | symbol, ...args: any[]) {
    const key = String(event);
    this._listeners[key]?.forEach((l) => l(...args));
    return this;
  }
}

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
