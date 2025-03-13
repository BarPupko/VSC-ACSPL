export * from './add';
export * from './sub';

import pkg from './package.json';

export const compose = (...fns) => {
  return fns.reduce((f, g) => (x) => f(g(x)));
};

export const pipe = (...fns) => {
  return fns.reduceRight((f, g) => (x) => f(g(x)));
};

export const curry = (fn) => {
  const totalArguments = fn.length;
  const next = (argumentLength, rest) => {
    if (argumentLength > 0) {
      return (...args) => {
        return next(
          argumentLength - args.length,
          [
            ...rest,
            ...args,
          ],
        );
      };
    }
    return fn(...rest);
  };
  return next(totalArguments, []);
};

export const tMap = new Map();
export const tSet = new Set();

export const getPackage = () => {
  return pkg;
};
