/**
 * Check built-files to ensure they have been regenated correctly
 * @ndaidong
 */

const fs = require('fs');
const test = require('tap').test;

const {
  isFunction,
} = require('bellajs');

const pkgFake = require('../data/package.json');
const proFile = './test/data/output/math.js';
const devFile = './test/data/output/math.min.js';
const mapFile = './test/data/output/math.min.map';

const proMath = require('../data/output/math');
const devMath = require('../data/output/math.min');


test('Validate production output', (t) => {
  t.ok(fs.existsSync(proFile), 'Production file must be generated');
  t.ok(fs.existsSync(mapFile), 'Map file must be generated');

  const s = fs.readFileSync(proFile, 'utf8');
  const a = s.split('\n');
  t.ok(s.length > 0 && a.length > 5, 'Production file must be not empty');

  t.ok(a[1] === ` * ${pkgFake.name}@${pkgFake.version}`, 'Package name must be correct');
  t.ok(a[2].startsWith(' * built on:'), 'Package built time must be showed');
  t.ok(a[3] === ` * repository: ${pkgFake.repository.url}`, 'Package repository must be correct');
  t.ok(a[4] === ` * maintainer: ${pkgFake.author}`, 'Package author must be correct');
  t.ok(a[5] === ` * License: ${pkgFake.license}`, 'Package license must be correct');

  t.end();
});

test('Validate development output', (t) => {
  t.ok(fs.existsSync(devFile), 'Development file must be generated');

  const s = fs.readFileSync(devFile, 'utf8');
  const a = s.split('\n');
  t.ok(s.length > 0 && a.length > 1, 'Development file must be not empty');
  const cmt = a[0];
  const pack = `${pkgFake.name}@${pkgFake.version}`;
  t.ok(cmt.includes(pack), 'Package must be presented with name and version');
  const author = `${pkgFake.author}`;
  t.ok(cmt.includes(author), 'Package author must be correct');
  const license = `${pkgFake.license}`;
  t.ok(cmt.includes(license), 'Package license must be correct');

  t.end();
});


const checkOutput = (math) => {
  test('Validate built module', (t) => {
    t.ok(isFunction(math.add), 'Module must have method "add"');
    t.ok(isFunction(math.sub), 'Module must have method "sub"');
    t.end();
  });
};

[proMath, devMath].map(checkOutput);

