const build = require('./build');
const readFile = require('./readFile');
const writeFile = require('./writeFile');
const rollupify = require('./rollupify');

module.exports = {
  build,
  rollupify,
  readFile,
  writeFile,
};
