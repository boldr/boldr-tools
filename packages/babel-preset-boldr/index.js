const client = require('./client');
const env = process.env.BABEL_ENV || process.env.NODE_ENV;
const server = require('./server');

if (env !== 'development' && env !== 'test' && env !== 'production') {
  throw new Error(
    `babel-preset-boldr invalid \`NODE_ENV\` or \`BABEL_ENV\`.
Valid are development|production|test, instead received ${JSON.stringify(env)}`
  );
}

module.exports = {};
module.exports.client = client;
module.exports.server = server;
