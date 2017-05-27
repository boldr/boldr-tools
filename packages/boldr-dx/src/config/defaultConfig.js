const getClientEnvironment = require('./env');

const envDefaults = getClientEnvironment();
module.exports = {
  env: {
    NODE_ENV: envDefaults.raw.NODE_ENV,
    BOLDR__SERVER_PORT: parseInt(envDefaults.raw.BOLDR__SERVER_PORT, 10),
    BOLDR__DEV_PORT: parseInt(envDefaults.raw.BOLDR__DEV_PORT, 10),
  },
  plugins: [
    require('../plugins/watchConfig'),
    require('../plugins/webpackPlugin'),
  ],
  bundle: {
    cssModules: true,
    wpProfile: false,
    webPath: '/assets/',
    babelrc: null,
  },
};
