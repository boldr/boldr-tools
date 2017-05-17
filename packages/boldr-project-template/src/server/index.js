/* @flow */
import express from 'express';
import path from 'path';
import http from 'http';
import Express from 'express';
import compression from 'compression';
import uuid from 'uuid';
import ssrMiddleware from './ssr';
import { ASSETS_DIR, PUBLIC_DIR, SERVER_PORT } from './config';

const app = express();
const server = http.createServer(app);
const host = process.env.SERVER_HOST || 'localhost';

// Remove annoying Express header addition.
app.disable('x-powered-by');

// Compress (gzip) assets in production.
app.use(compression());
// Create a nonce and attach it to the request. This allows us to safely
// use CSP to inline scripts.
app.use((req, res, next) => {
  res.locals.nonce = uuid.v4(); // eslint-disable-line no-param-reassign
  next();
});

// Setup the public directory so that we can serve static assets.
app.use(Express.static(PUBLIC_DIR));
// Pass any get request through the SSR middleware before sending it back
app.get('*', ssrMiddleware);

const listener = server.listen(SERVER_PORT, () => {
  console.log(`🚀  Server running on port: ${SERVER_PORT}`);
});

export default listener;
