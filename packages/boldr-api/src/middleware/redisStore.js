/* eslint-disable no-return-await */
require('dotenv').config();

import url from 'url';
import { Store } from 'koa-session2';
import Redis from 'ioredis';
import bluebird from 'bluebird';
import { logger } from '../services';

// $FlowIssue
const redisCon = url.parse(process.env.REDIS_URI);
// $FlowIssue
const hostAddr = redisCon.host.split(':');

class RedisStore extends Store {
  constructor() {
    super();
    this.redis = new Redis({
      port: redisCon.port,
      host: hostAddr[0],
      db: 0,
    });
  }

  async get(sid) {
    const data = await this.redis.get(`SESSION:${sid}`);
    return JSON.parse(data);
  }

  async set(session, { sid = this.getID(24), maxAge = 1000000 } = {}) {
    try {
      // Use redis set EX to automatically drop expired sessions
      await this.redis.set(`SESSION:${sid}`, JSON.stringify(session), 'EX', maxAge / 1000);
    } catch (e) {
      return;
    }
    return sid;
  }

  async destroy(sid) {
    return await this.redis.del(`SESSION:${sid}`);
  }
}

module.exports = RedisStore;
