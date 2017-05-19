/* @flow */
/* eslint-disable no-console */
// set environment to development
process.env.NODE_ENV = 'development';

import fs from 'fs';
import logger from 'boldr-utils/es/logger';
import Engine from '../engine';

const engine: Engine = new Engine(fs.realpathSync(process.cwd()), undefined);

process.on('SIGINT', () => {
  engine.stop();
});

engine.start().catch(e => {
  console.log(e);
  process.exit(1);
});
