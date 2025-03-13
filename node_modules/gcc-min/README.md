# gcc-min
Simplify package building process with Rollup.
Just write the mudules using ES6 Modules syntax, and let's gcc-min build them to a single file.

[![NPM](https://badge.fury.io/js/gcc-min.svg)](https://badge.fury.io/js/gcc-min)
![CI test](https://github.com/ndaidong/gcc-min/workflows/ci-test/badge.svg)


## Usage

Install:

```bash
npm install gcc-min
```

Run command to build:

```bash
gccmin --entry entryFile --name moduleName --file fileName --output outputDir --package pathToPackageJSONFile

// or
gccmin -e entryFile -n moduleName -f fileName -o outputDir -p pathToPackageJSONFile
```

Or Node APIs

```js
const gccmin = require('gcc-min');

gccmin(path entryFile, String moduleName, String fileName, path outputDir, Object config);

```

In which:


- `entryFile`: path to entry file that will be processed by Rollup
- `moduleName`: name of module, to be accessible from global scope
- `fileName`: name of file will be generated, if not specify, it's the same as moduleName
- `outputDir`: location to save generated files to
- `config`: a JavaScript object which contain the meta data info to insert into the output files. It may be extracted from package.json file.


The config object must provide the following properties:

```json
{
  name: String,
  version: String in semver format, e.g: '1.2.3'
  author: String,
  repository: Object {
    type: 'git',
    url: "https://github.com/username/reponame"
  },
  license: String
}

```


## Test

```bash
git clone https://github.com/ndaidong/gcc-min.git
cd gcc-min
npm install
npm test
```

# License

The MIT License (MIT)
