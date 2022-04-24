import { EventEmitter } from "events";

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

  request<T>(action: string, request?: any) {
    const id = uid();

    return new Promise<T>((next, error) => {
      this.once(id, ({ response }) => {
        if (response instanceof Error) error(response);
        else next(response);
      });
      this.send({ action, id, args: request });
    });
  }

  fetch(request: Request | string) {
    return this.request<Blob>("fetch", request);
  }

  fetchChapter(request: Request | string) {
    return this.request<string>("fetchChapter", request);
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
