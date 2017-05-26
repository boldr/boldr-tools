import fs from 'fs';
import logger from 'boldr-utils/es/logger';
import Engine from '../engine';

function task(args, options) {
  logger.info('Loading configuration.');
  const inputOptions = options;
  const engine = new Engine(inputOptions);
  engine.start().catch(e => {
    logger.error(e);
    process.exit(1);
  });
  process.on('SIGINT', () => {
    engine.stop();
  });
}

function register(program) {
  program
    .command('dev', 'Launch the development process.')
    .option('-p, --port <num>', 'Dev server port', program.INT, 1)
    .action(task);
}

export default { register };
