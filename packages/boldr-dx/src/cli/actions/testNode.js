
import cloneDeep from 'lodash/cloneDeep';
import jest from 'jest';
import shell from 'shelljs';

const jestConfigBuilder = require('../../config/jestNode');
const paths = require('../../config/paths');
const compileConfigs = require('../../utils/compileConfigs');


module.exports = (config, flags) => {
  // Comment the following to see verbose shell ouput.
  shell.config.silent = false;

  // set BABEL_ENV to test if undefined
  process.env.BABEL_ENV = process.env.BABEL_ENV || 'test';

  let jestConfig = jestConfigBuilder(paths.SRC_DIR);
  jestConfig = config.modifyJestConfig(cloneDeep(jestConfig));

  // Run Jest
  jest.run(['--config', JSON.stringify(jestConfig), ...flags]);
};
