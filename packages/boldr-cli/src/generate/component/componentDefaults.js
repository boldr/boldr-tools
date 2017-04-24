import fs from 'fs';
import path from 'path';

let pkg = {};

try {
  pkg = require(path.resolve(process.cwd(), 'package.json'));
} catch (err) {
  throw Error('unable to find package.json');
}

const defaultOptions = {
  directory: 'shared/components',
  cssExtension: 'scss',
  semi: true,
  fileFormat: 'pascalCase',
  componentFormat: 'pascalCase',
  test: 'jest',
};

export default options => {
  const defaults = Object.assign({}, defaultOptions || {});

  defaults.isStateless = Boolean(options.stateless);
  defaults.semi = options.semi;

  if (options.test) {
    defaults.test = options.test === 'none' ? false : options.test;
  }

  if (options.cssExtension) {
    defaults.cssExtension = options.cssExtension;
  }

  if (options.directory) {
    defaults.directory = options.directory;
  }

  return defaults;
};
