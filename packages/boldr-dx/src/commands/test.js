import jest from 'jest';
import shell from 'shelljs';

module.exports = (config, flags) => {
  // Comment the following to see verbose shell ouput.
  shell.config.silent = false;

  // set BABEL_ENV to test if undefined
  process.env.BABEL_ENV = process.env.BABEL_ENV || 'test';
  // Run Jest
  jest.run(['--config', '.boldr/jest.json', ...flags]);
};
