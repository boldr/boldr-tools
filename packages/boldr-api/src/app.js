/**
 * @module boldr-api/app
 * ./src/app
 */
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import koaRouter from 'koa-router';
import cors from 'kcors';
import helmet from 'koa-helmet';
import convert from 'koa-convert';
import session from 'koa-session2';
import _debug from 'debug';

import { logger, db } from './services';
import { errorCatcher, responseTime, RedisStore } from './middleware';

const debug = _debug('boldrAPI:app');

const app = new Koa();

app
  .use(responseTime)
  .use(cors({
    credentials: true,
    methods: 'GET, HEAD, OPTIONS, PUT, POST, DELETE',
    headers: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  }))
  .use(helmet())
  .use(bodyParser())
  .use(session({
    store: new RedisStore(),
  }))
  .use(errorCatcher);

export default app;
