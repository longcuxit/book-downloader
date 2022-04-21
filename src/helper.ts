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

  async waitFor(getter: () => any, time = 500) {
    const check = async (): Promise<any> => {
      const result = await Promise.resolve(getter());
      if (result) return result;
      await _.delay(time);
      return check();
    };
    return check();
  },

  async asyncReduce<T, V>(
    getter: () => V | undefined,
    next: (old: T, value: V) => T,
    from: T
  ) {
    while (true) {
      const value = await Promise.resolve(getter());
      if (value === undefined) return from;
      from = await Promise.resolve(next(from, value));
    }
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
  tagsFromElements(els: HTMLElement[]) {
    return els
      .map(function (el) {
        var text = el.innerText.trim();
        const link = el.tagName === "A" ? el : (_.query("a", el) as any);
        if (link) {
          text = '<a href="' + link.href + '">' + text + "</a>";
        }
        return text;
      })
      .join(", ");
  },

  cleanHTML(
    html: string,
    custom: Record<string, (match: string) => string> = {},
    ignore: string[] = []
  ) {
    const ignoreTags = ignore.flatMap((name) => {
      return [`<${name} `, `</${name}>`];
    });

    const customEntries = Object.entries(custom).map(([name, call]) => {
      ignoreTags.push(`</${name}>`);
      return [`<${name} `, call] as [string, (match: string) => string];
    });

    html = html.replaceAll(/<[^>]*>/g, (match) => {
      const lowerCase = match.toLocaleLowerCase();
      const custom = customEntries.find((entry) => match.startsWith(entry[0]));
      if (custom) return custom[1](match);
      if (ignoreTags.find((tag) => lowerCase.startsWith(tag))) {
        return match;
      }
      return "<br/>";
    });
    html = html.replaceAll(/> +</g, "><");
    html = html.replaceAll(/(<br\/>)+/g, "<br/><br/>");
    return html;
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
