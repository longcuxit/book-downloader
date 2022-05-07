declare global {
  function final<T>(value: T, ...args: (((value: T) => void) | any)[]): T;
}

global.final = (value, ...args) => {
  args.forEach((arg) => {
    if (arg instanceof Function) {
      arg(value);
    }
  });
  return value;
};

export {};
