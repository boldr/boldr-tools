require('dotenv').config();

import http from 'http';
import { Model } from 'objection';

import app from './app';
import { logger, db, disconnect } from './services';

const debug = require('debug')('boldrAPI:engine');

const PORT = process.env.API_PORT || 2121;

const server = http.createServer(app.callback());

Model.knex(db);

server.listen(PORT);
server.on('error', (err) => {
  logger.error(`⚠️  ${err}`);
  throw err;
});

server.on('listening', () => {
  const address = server.address();
  logger.info('Starting server on %s%s', address.address, address.port);
});

process.on('SIGINT', () => {
  logger.info('shutting down!');
  disconnect();
  server.close();
  process.exit();
});

process.on('uncaughtException', (error) => {
  logger.error(`uncaughtException: ${error.message}`);
  logger.error(error.stack);
  process.exit(1);
});
