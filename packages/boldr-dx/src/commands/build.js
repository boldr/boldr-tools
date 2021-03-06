import fs from 'fs';
import logger from 'boldr-utils/es/logger';
import Engine from '../engine';

function task(args, options) {
  logger.info('Loading configuration.');
  const engine = new Engine();
  engine.build().then(
    () => {
      logger.end('Build finished successfully.');
      process.exit(0);
    },
    err => {
      logger.error('Build task failed...');
      logger.error(err);
      process.exit(1);
    },
  );
}

function register(program) {
  program
    .command('build', 'Compile the browser and server bundles for production.')
    .action(task);
}

export default { register };
