import path from 'path';
import fs from 'fs-extra';
import logger from 'boldr-utils/es/logger';
import loadConfig from '../config/loadConfig';

function clean(config) {
  const rootDir = process.cwd();
  fs.removeSync(`${rootDir}/node_modules/.cache/`);
  fs.removeSync(config.bundle.assetsDir);
  fs.removeSync(config.bundle.server.bundleDir);
  fs.removeSync(config.bundle.assetsDir);
}

function cleanInput(directory) {
  const rootDir = process.cwd();
  fs.removeSync(`${rootDir}/${directory}`);
}

function task(args, options) {
  logger.task('Cleaning up');
  const config = loadConfig();
  clean(config);

  const { directory } = options;
  if (directory) {
    cleanInput(directory);
  }
  logger.end('Removed cache, built client files, and compiled server.');
}

function register(program) {
  program
    .command('clean', 'Remove files or directories.')
    .help('By default, cache, assets dir and the compiled server are removed.')
    .option(
      '-d, --directory [dir]',
      'Path from current working directory to the directory or file to remove.',
    )
    .action(task);
}

export default { register };
