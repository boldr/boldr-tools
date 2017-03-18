import path from 'path';
import express from 'express';
import cors from 'cors';
import uuid from 'uuid';
import compression from 'compression';
import hpp from 'hpp';
import ssrMiddleware from './ssr';

const app = express();

// Attach a unique "nonce" to every response.  This allows use to declare
// inline scripts as being safe for execution against our content security policy.
// @see https://helmetjs.github.io/docs/csp/
function nonceMiddleware(req, res, next) {
  res.locals.nonce = uuid.v4();
  next();
}
app.disable('x-powered-by');
app.set('trust proxy', 'loopback');
app.use(nonceMiddleware);
app.use(compression());
// enable CORS - Cross Origin Resource Sharing
// allow for sending credentials (auth token) in the headers.
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// Setup the public directory so that we can server static assets.
app.use(express.static(path.join(process.cwd(), 'public')));

app.get('*', ssrMiddleware);

export default app;
