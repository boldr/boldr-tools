import path from 'path';
import glob from 'glob';
import stylelint from 'stylelint';
import { logger } from 'boldr-utils';

const paths = require('../../config/paths');

module.exports = () => {
  const handleError = (error) => {
    logger.error(error);
    process.exit(1);
  };

  const stylelintrc = glob.sync(`${paths.ROOT_DIR}/.stylelintrc*`);
  const configFile = stylelintrc.length
      ? stylelintrc[0]
      : path.join(__dirname, '../../config/.stylelintrc');

  logger.info(`Using Stylelint file: ${configFile}`);

  stylelint.lint({
    files: [`${paths.SHARED_DIR}/**/*.css`, `${paths.SHARED_DIR}/**/*.scss`],
    formatter: 'string',
    configFile,
  })
  .then((result) => {
    if (result.output) {
      handleError(`\n${result.output}`);
    } else {
      logger.end('Looking so damn stylish 🏆');
      process.exit(0);
    }
  })
  .catch((error) => {
    handleError(error.stack);
  });
};
