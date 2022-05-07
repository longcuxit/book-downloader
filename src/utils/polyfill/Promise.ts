declare global {
  interface PromiseConstructor {
    delay<T = void>(time?: number, value?: T): Promise<T>;
  }
}

Promise.delay = (time, value) =>
  new Promise((next) => setTimeout(() => next(value as any), time));

export {};
