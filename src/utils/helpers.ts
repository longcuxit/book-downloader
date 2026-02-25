export const delay = <T = void>(time?: number, value?: T): Promise<T> =>
  new Promise((next) => setTimeout(() => next(value as any), time));

export const final = <T>(value: T, ...args: (((value: T) => void) | any)[]): T => {
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
