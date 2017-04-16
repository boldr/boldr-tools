/* eslint-disable no-console */
import path from 'path';
import url from 'url';
import shell from 'shelljs';
import merge from 'lodash/merge';
import logger from 'boldr-utils/es/logger';
import paths from './paths';

module.exports = optionalConfig => {
  let config;

  // base config options
  const baseConfig = {
    serveAssetsFrom: '/assets/',
    serverPort: process.env.SERVER_PORT || 3000,
    serverHost: process.env.SERVER_HOST || 'localhost',
    serverUrl: 'http://localhost:3000',
    apiPrefix: process.env.API_PREFIX || '/api/v1',
    apiHost: process.env.API_HOST || 'localhost',
    apiPort: process.env.API_PORT || 2121,
    hmrPort: process.env.HMR_PORT || 3001,
    isVerbose: true,
    isDebug: false,
  };

  const boldrConfigPath = optionalConfig
  ? path.join(paths.rootDir, optionalConfig)
  : paths.boldrConfigPath;

  // Find user config
  if (shell.test('-f', boldrConfigPath)) {
    try {
      logger.log('');
      logger.info(`Using boldr-dx config at ${boldrConfigPath}`);
      // eslint-disable-next-line global-require,import/no-dynamic-require
      config = require(boldrConfigPath);
    } catch (error) {
      logger.error('Error loading your boldr.config.js:', error);
      process.exit(1);
    }
  }

  config = merge({}, baseConfig, config);
  // Create default identity functions for modify functions
  ['editWebpackCfg', 'modifyJestConfig'].forEach(m => {
    if (typeof config[m] !== 'function') {
      config[m] = c => c;
    }
  });

  return Object.freeze(config);
};
