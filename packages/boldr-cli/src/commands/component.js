/* eslint-disable max-lines, max-statements, camelcase */

import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import logger from 'boldr-utils/es/logger';
import generateComponent from '../generate/component/generateComponent';
import cliPkgJson from '../../package.json';
import spinner from '../util/spinner';
import handleErrors from '../util/handleErrors';

function task(args, options) {
  logger.start('Creating your new component.');
  const { component } = args;
  try {
    const { files, componentName, componentPath } = generateComponent(
      component,
    );
    logger.info(
      `Generated ${chalk.cyan.bold(componentName)} at ${chalk.cyan(`./${path.relative(process.cwd(), componentPath)}`)}:`, // eslint-disable-line
    );
    for (const file of files) {
      logger.task(` - ${file.fileName}`);
    }
  } catch (error) {
    logger.error(error.message);
  }

  logger.end('All set.');
}

function register(program) {
  program
    .command('component', 'Generate a new React component.')
    .option('-s, --stateless', 'Generate a new stateless React component.')
    .option(
      '-c, --css-extension [extension]',
      'Change the style type (default: scss)',
    )
    .option(
      '-d, --directory [dir]',
      'Specify component directory (default: src/shared/components)',
    )
    .option('--test [type]', 'either "jest" or "none"')
    .argument('<component>', 'Component name')
    .action(task);
}

export default { register };
