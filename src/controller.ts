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
  port?: chrome.runtime.Port;

  get active() {
    return new Promise<chrome.tabs.Tab>((next) => {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) =>
        next(tab)
      );
    });
  }

  async connect() {
    if (!this.port) {
      await this.active.then((tab) => {
        return new Promise<void>((next) => {
          const port = chrome.tabs.connect(tab.id!, { name: "ebook" });
          port.onMessage.addListener((data, port) => {
            console.log(port, data);
            if (typeof data !== "object") return;
            if (data.id) this.emit(data.id, data);
          });
          port.onDisconnect.addListener(() => {
            console.log("disconnect");
            delete this.port;
          });
          this.port = port;
          next();
        });
      });
    }
    return this.port!;
  }

  async send(msg: any) {
    const port = await this.connect();
    port.postMessage(msg);
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
    return fetch(request).then((rs) => rs.blob());
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
