import path from 'path';
import http from 'http';

import app from './app';

const debug = require('debug')('boldr:ssr-server');

const server = http.createServer(app);
const host = process.env.SERVER_HOST;
const processPort = process.env.SERVER_PORT;
const port = parseInt(processPort, 10) || 3000;

server.listen(port, host, () => {
  console.log(`🚀  server started on port: ${port}`); // eslint-disable-line no-console
});

process.on('SIGINT', () => {
  console.log('shutting down!');
  // disconnect();
  server.close();
  process.exit();
});

process.on('uncaughtException', (error) => {
  console.error(`uncaughtException: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
});

export { server };

export default server;
