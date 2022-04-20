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
};
