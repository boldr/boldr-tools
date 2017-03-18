
async function responseTime(ctx, next) {
  const t1 = Date.now();
  await next();
  const t2 = Date.now();
  ctx.set('X-Response-Time', `${Math.ceil(t2 - t1)}ms`);
}

export default responseTime;
