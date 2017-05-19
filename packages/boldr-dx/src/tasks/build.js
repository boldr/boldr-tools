/* @flow */
/* eslint-disable no-console */

// set environment to production
process.env.NODE_ENV = 'production';

import fs from 'fs';
import logger from 'boldr-utils/es/logger';
import Engine from '../engine';

const engine: Engine = new Engine(fs.realpathSync(process.cwd()), undefined);

engine.build().then(
  () => {
    logger.end('Successfully built');
    process.exit(0);
  },
  err => {
    logger.error('Build failed');
    logger.error(err);
    process.exit(1);
  },
);
