import path from 'path';
import glob from 'glob';
import shell from 'shelljs';
import { logger } from 'boldr-utils';

const paths = require('../../config/paths');

module.exports = (config, flags) => {
  const eslintrc = glob.sync(`${paths.rootDir}/.*eslintrc*`);
  const configFile = eslintrc.length
      ? eslintrc[0]
      : path.join(__dirname, '../../config/.eslintrc.base.json');

  logger.info(`Using ESLint file: ${configFile}`);

  const lint = () => {
    shell.config.silent = false;
    const eslintLib = require.resolve('eslint');
    const eslint = eslintLib.replace(/(.*)(lib\/api\.js)/, '$1bin/eslint.js');

    const cmd = `${eslint} src/ -c ${configFile} --color ${flags.join(' ')}`;
    const output = shell.exec(cmd);
    if (output.code === 0) {
      logger.end(`Finished linting your code. ${output.stdout === '' ? 'Damn, is it beautiful  💕' :
        'Maybe you want to check it over again  😦'}`);
    }

    process.exit(output.code > 0 ? 1 : 0);
  };

  lint();
};
