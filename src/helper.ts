import { ComponentType, createElement, ReactElement, ReactNode } from "react";

export const helper = {
  stringToDom(html: string, selector?: string) {
    html = html.replace(/ src=/gi, " data-src=");
    const div = document.createElement("div");
    div.innerHTML = html;
    return selector ? div.querySelector(selector) : div;
  },

  async noCors(
    src: string,
    transfer: (url: string) => Promise<Blob | undefined>
  ) {
    const urls: string[] = [
      `https://api.allorigins.win/raw?url=${encodeURI(src)}`,
      `https://api.codetabs.com/v1/proxy/?quest=${encodeURI(src)}`,
      `https://cors-anywhere.herokuapp.com/${src}`,
    ];

    for await (const url of urls) {
      try {
        const blob = await transfer(url);
        if (blob) return blob;
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
    return new Promise<Blob | undefined>((next) => {
      var img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.height = img.naturalHeight;
        canvas.width = img.naturalWidth;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => next(blob ?? undefined), type);
      };
      img.onerror = () => next(undefined);
      img.src = src;
    });
  },

  base64URL(value: string) {
    return `data:text;base64,${btoa(value)}`;
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

    html = html.replace(/<[^>]*>/gi, (match) => {
      if (skip.find((tag) => match.startsWith(tag))) {
        return match;
      }
      return "<br/>";
    });
    html = html.replace(/>( |\n|\t)+</gi, "><");
    html = html.replace(/(<br\/>)+/gi, "<br/><br/>");
    html = html.replace(/^(<br\/>)+/gi, "");
    html = html.replace(/(<br\/>)+$/gi, "");
    return html;
  },
};

export const withContainer = (
  ...containers: ComponentType<{ children: ReactNode }>[]
) => {
  return function <C extends ComponentType<P>, P>(com: C) {
    return ((props: P) => {
      containers = [...containers];
      let children: ReactElement = createElement(com, props);
      while (containers.length) {
        children = createElement(containers.pop()!, { children });
      }
      return children;
    }) as C;
  };
};
