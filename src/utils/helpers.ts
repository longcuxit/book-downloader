export const delay = <T = void>(time?: number, value?: T): Promise<T> =>
  new Promise((next) => setTimeout(() => next(value as any), time));

export const final = <T>(
  value: T,
  ...args: (((value: T) => void) | any)[]
): T => {
  args.forEach((arg) => {
    if (arg instanceof Function) {
      arg(value);
    }
  });
  return value;
};

export const remove = <T>(arr: T[], ...items: T[]): T[] => {
  return items.filter((item) => {
    const index = arr.indexOf(item);
    if (index < 0) return false;
    arr.splice(index, 1);
    return true;
  });
};

export const getFirst = <T>(arr: T[]): T | undefined => arr[0];

export const getLast = <T>(arr: T[]): T | undefined => arr[arr.length - 1];

export const getKeys = Object.keys as <T extends object>(obj: T) => (keyof T)[];

import { ComponentType, createElement, ReactElement, ReactNode } from "react";
import { control } from "./controller";

export const helper = {
  stringToDom(html: string, selector?: string) {
    html = html.replace(/ src=/gi, " data-src=");
    const div = document.createElement("div");
    div.innerHTML = html;
    return selector ? div.querySelector(selector) : div;
  },

  async getClientImage(
    src: string,
    transfer: (url: string) => Promise<Blob | undefined>,
  ) {
    try {
      const blob = await control.fetch(src);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const result = await transfer(url);
        URL.revokeObjectURL(url);
        return result;
      }
    } catch (error) {
      console.log(error);
    }
  },
  hashString(value: string) {
    let hash = 0;
    let chr: number;
    if (value.length === 0) return hash.toString(16).toString();
    for (let i = 0; i < value.length; i++) {
      chr = value.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0;
    }
    return hash.toString(16).toString();
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
    skip = [...skip, "br", "p", "div", "span"].flatMap((tag) => [
      `<${tag}`,
      `</${tag}>`,
    ]);

    html = html.replace(/<[^>]*>/gi, (match) => {
      if (skip.find((tag) => match.startsWith(tag))) {
        return match;
      }
      return "";
    });
    return html;
  },
};

export const withContainer = (
  ...containers: ComponentType<{ children: ReactNode }>[]
) => {
  return function <C extends ComponentType<P>, P>(Com: C) {
    return ((props: P) => {
      containers = [...containers];
      let children: ReactElement = createElement(Com as any, props as any);
      while (containers.length) {
        children = createElement(containers.pop()!, { children });
      }
      return children;
    }) as C;
  };
};
