// rollupify

const debug = require('debug');
const info = debug('gccmin:info');
const error = debug('gccmin:error');

const {rollup} = require('rollup');
const {nodeResolve} = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const rjson = require('@rollup/plugin-json');
const cleanup = require('rollup-plugin-cleanup');
const terser = require('terser');

const jsminify = (source = '') => {
  info('Minifying...');
  return terser.minify(source, {sourceMap: true});
};

const rollupify = async (input, name = '') => {
  info('Rollup start...');
  try {
    info('Start parsing JS file with Rollup...');
    const bundle = await rollup({
      input,
      plugins: [
        nodeResolve(),
        commonjs({
          include: 'node_modules/**',
          sourceMap: false,
        }),
        rjson({
          preferConst: true,
          indent: '  ',
        }),
        cleanup(),
      ],
    });

    const {output} = await bundle.generate({
      format: 'umd',
      indent: true,
      strict: false,
      name,
    });

    const codeParts = [];
    for (const chunkOrAsset of output) {
      if (chunkOrAsset.isAsset) {
        codeParts.push(chunkOrAsset.source);
      } else {
        codeParts.push(chunkOrAsset.code);
      }
    }
    info('Rollupified JS content.');

    const jsCode = codeParts.join('\n');

    const data = {code: jsCode};
    const min = await jsminify(jsCode);
    if (!min.error) {
      data.minified = min.code;
      data.map = min.map;
    }
    return data;
  } catch (err) {
    error(err);
  }
};

module.exports = async (entry, name) => {
  const output = await rollupify(entry, name);
  return output;
};
