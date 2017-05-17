import fs from 'fs';
import logger from 'boldr-utils/es/logger';
import Engine from '../engine';

function task(args, options) {
  logger.info('Loading configuration.');
  const engine = new Engine(fs.realpathSync(process.cwd()), undefined);
  engine.start().catch(e => {
    logger.error(e);
    process.exit(1);
  });
  process.on('SIGINT', () => {
    logger.info('Dev process stopped.');
    engine.stop();
  });
}

function register(program) {
  program.command('dev', 'Launch the development process.').action(task);
}

export default { register };
