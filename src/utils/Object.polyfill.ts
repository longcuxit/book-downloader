declare global {
  interface ObjectConstructor {
    keys<T extends object>(obj: T): (keyof T)[];
  }
}

export {};
