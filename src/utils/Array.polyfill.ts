import { applyMixins } from "./mixin";

declare global {
  interface Array<T> {
    readonly first?: T;
    readonly last?: T;
    remove(...items: T[]): T[];
  }
}

interface ArrayPolyfill<T> extends Array<T> {}

class ArrayPolyfill<T> {
  get first(): T {
    return this[0];
  }

  get last(): T {
    return this[this.length - 1];
  }

  remove(...items: T[]) {
    return items.filter((item) => {
      const index = this.indexOf(item);
      if (index < 0) return false;
      this.splice(index, 1);
      return true;
    });
  }
}

applyMixins(Array, ArrayPolyfill);
export {};
