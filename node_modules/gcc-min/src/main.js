#!/usr/bin/env node

/* eslint max-params: 0 */

const {existsSync} = require('fs');
const {normalize} = require('path');
const {execSync} = require('child_process');

const {
  writeFile,
  rollupify,
} = require('../builder');

const release = (result, mname, fileName = '', outputDir = './', pack = {}) => {
  const output = normalize(outputDir);

  const releaseAt = (new Date()).toUTCString();

  const {
    name,
    version,
    author,
    repository,
    license,
  } = pack;

  const minHeader = `// ${name}@${version}, by ${author} - built on ${releaseAt} - published under ${license} license`;

  const fullHeader = [
    `/**`,
    ` * ${name}@${version}`,
    ` * built on: ${releaseAt}`,
    ` * repository: ${repository.url}`,
    ` * maintainer: ${author}`,
    ` * License: ${license}`,
    `**/`,
  ].join('\n');

  if (existsSync(output)) {
    execSync('rm -rf ' + output);
  }
  execSync(`mkdir ${output}`);

  const {
    code,
    minified,
    map: sourceMap,
  } = result;

  const fname = fileName || mname;

  writeFile(`${output}/${fname}.js`, [fullHeader, code].join('\n'));

  if (result.minified) {
    writeFile(`${output}/${fname}.min.js`, [minHeader, minified].join('\n'));
  }

  if (result.map) {
    writeFile(`${output}/${fname}.min.map`, sourceMap);
  }
};


module.exports = async (entryFile, mname, fname, output, pack) => {
  const entry = normalize(entryFile);
  const result = await rollupify(entry, mname);
  release(result, mname, fname, output, pack);
};

