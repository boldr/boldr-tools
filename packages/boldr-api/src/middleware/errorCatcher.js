import { logger } from '../services';

const UNKNOWN_ERROR_CODE = 500;

export default (async function errorCatcher() {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || UNKNOWN_ERROR_CODE;
    ctx.body = err.message || '';

    logger.error(`${ctx.status} response: ${ctx.body}`, { requestId: ctx.requestId });
    if (ctx.status === UNKNOWN_ERROR_CODE) {
      logger.error(`${err.stack}`, { requestId: ctx.requestId });
    }
  }
});
