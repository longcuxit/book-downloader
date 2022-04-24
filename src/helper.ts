import EventEmitter from "events";
import { useEffect, useState } from "react";

export const helper = {
  stringToDom(html: string, selector?: string) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return selector ? div.querySelector(selector) : div;
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
        const image = await helper.imageToBlob(url);
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
      handles[name] = helper.debounce((value: any) => {
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
