#!/usr/bin/env node

const {join, normalize} = require('path');

const minimist = require('minimist');

const argv = minimist(process.argv.slice(2));
let entry = argv.entry || argv.e;
const mname = argv.name || argv.n;
const fname = argv.file || argv.f;
let output = argv.output || argv.o;
const pkg = argv.package || argv.p;

const build = require('../src/main');

let fullPath = __dirname;
const subDir = '/node_modules/gcc-min/builder';
if (fullPath.includes(subDir)) {
  fullPath = fullPath.replace(subDir, '');
}

const getPackage = (file = 'package.json') => {
  const f = join(fullPath, normalize(file));
  return require(f);
};

const pack = getPackage(pkg);
if (pack) {
  entry = join(fullPath, normalize(entry));
  output = join(fullPath, normalize(output));
  build(entry, mname, fname, output, pack);
}

module.exports = {
  build,
};
