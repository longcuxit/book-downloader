import EventEmitter from "events";
import { useEffect, useState } from "react";

export const _ = {
  query(selector: string, from: HTMLElement | Document = document) {
    return from.querySelector(selector) as HTMLElement | undefined;
  },

  queryAll(selector: string, from: HTMLElement | Document = document) {
    return Array.from(from.querySelectorAll(selector));
  },

  getText(selector: string, from: HTMLElement | Document = document) {
    const el = _.query(selector, from);
    return el?.innerText.trim() ?? "";
  },

  getAttr(
    selector: string,
    attr: string,
    from: HTMLElement | Document = document
  ) {
    const el = _.query(selector, from);
    return (el as any)?.[attr];
  },

  getImage(src: string) {
    return new Promise<string | undefined>((next) => {
      var img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.height = img.naturalHeight;
        canvas.width = img.naturalWidth;
        ctx.drawImage(img, 0, 0);
        next(canvas.toDataURL("image/jpeg"));
      };
      img.onerror = () => next(undefined);
      img.src = src;
    });
  },
  emptyImage:
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",

  async waitFor(condition: () => any, time = 500) {
    const check = async (): Promise<any> => {
      const result = await Promise.resolve(condition());
      if (result) return result;
      await _.delay(time);
      return check();
    };
    return check();
  },

  delay<T = undefined>(time = 0, value?: T) {
    return new Promise<T>((next) => setTimeout(() => next(value as T), time));
  },

  debounce<T extends Function>(call: T, time = 10) {
    let timeOut: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeOut);
      timeOut = setTimeout(() => call.apply(null, args), time);
    }) as any as T;
  },
};

export const useEventEmitter = (emitter: EventEmitter, types: string) => {
  const [value, forceUpdate] = useState<Record<string, any>>({});

  useEffect(() => {
    const names = types.split(",");
    const handles: Record<string, (v: any) => void> = {};
    names.forEach((name) => {
      handles[name] = _.debounce((value: any) => {
        forceUpdate((old) => {
          return { ...old, [name]: value };
        });
      });

      emitter.on(name, handles[name]);
    });

    return () => {
      names.forEach((name) => {
        emitter.off(name, handles[name]);
      });
    };
  }, [emitter, types]);
  return value;
};
