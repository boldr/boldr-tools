import path from 'path';
import http from 'http';
import Express from 'express';
import compression from 'compression';
import uuid from 'uuid';
import ssrMiddleware from './middleware/ssr';

const app = new Express();
const server = http.createServer(app);
const host = process.env.SERVER_HOST || 'localhost';
const processPort = process.env.SERVER_PORT;

const port = parseInt(processPort, 10) || 3000;

// Remove annoying Express header addition.
app.disable('x-powered-by');

// Compress (gzip) assets in production.
app.use(compression());
app.use((req, res, next) => {
  res.locals.nonce = uuid.v4(); // eslint-disable-line no-param-reassign
  next();
});

// Setup the public directory so that we can server static assets.
app.use(Express.static(path.join(process.cwd(), 'public')));
// app.use('/assets', Express.static(path.join(process.cwd(), BOLDR.PUBLIC_DIR, 'assets')));

app.get('*', ssrMiddleware);

server.listen(port, host, () => {
  console.log(`🚀  server started on port: ${port}`); // eslint-disable-line no-console
});
