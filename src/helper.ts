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

  stringToDom(html: string, selector?: string) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return selector ? _.query(selector, div) : div;
  },

  getAttr(
    selector: string,
    attr: string,
    from: HTMLElement | Document = document
  ) {
    const el = _.query(selector, from);
    return (el as any)?.[attr];
  },

  async downloadImage(src?: string) {
    if (!src) return;
    const urls: string[] = [
      `https://api.allorigins.win/raw?url=${encodeURI(src)}`,
      `https://cors-anywhere.herokuapp.com/${src}`,
      src,
    ];

    for await (const url of urls) {
      try {
        const image = await _.imageToBlob(url);
        if (image) return image;
      } catch (error) {
        console.log(error);
      }
    }
  },
  hashString(value: string) {
    let hash = 0;
    let chr: number;
    if (value.length === 0) return hash;
    for (let i = 0; i < value.length; i++) {
      chr = value.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0;
    }
    return hash.toString(16);
  },

  imageToBlob(src: string, type: string = "image/webp") {
    return new Promise<Blob | null>((next) => {
      var img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.height = img.naturalHeight;
        canvas.width = img.naturalWidth;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(next, type);
      };
      img.onerror = () => next(null);
      img.src = src;
    });
  },

  async waitFor(getter: () => any, time = 100) {
    const check = async (): Promise<any> => {
      const result = await Promise.resolve(getter());
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
  linkFormat(link: HTMLLinkElement) {
    return '<a href="' + link.href + '">' + link.innerText.trim() + "</a>";
  },
  tagsFromElements(els: HTMLElement[]) {
    return els
      .map((el) => {
        var text = el.innerText.trim();
        const link = el.tagName === "A" ? el : (_.query("a", el) as any);
        if (link) return _.linkFormat(link);
        return text;
      })
      .join(", ");
  },

  cleanHTML(html: string, skip: string[] = []) {
    skip = skip.flatMap((tag) => [`<${tag}`, `</${tag}>`]);

    html = html.replaceAll(/<[^>]*>/g, (match) => {
      if (skip.find((tag) => match.startsWith(tag))) {
        return match.replace(/ .+>/, ">");
      }
      return "<br/>";
    });
    html = html.replaceAll(/>( |\n|\t)+</g, "><");
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
