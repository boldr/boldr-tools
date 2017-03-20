import express from 'express';
import routes from './routes/index';
import redisClient from './services/redis';
import {
  expressMiddleware,
  authMiddleware,
  rbac,
  errorHandler,
} from './middleware';

// const cache = require('express-redis-cache')({ client: redisClient });
const debug = require('debug')('boldrAPI:app');

const app = express();

expressMiddleware(app);
authMiddleware(app);
app.use(rbac());

// attaches to router
routes(app);

errorHandler(app);

export default app;
