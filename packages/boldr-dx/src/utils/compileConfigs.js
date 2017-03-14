import path from 'path';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'webpack-merge';
import shell from 'shelljs';
import webpack from 'webpack';
import { logger } from 'boldr-utils';

const baseConfig = require('../config/webpack/webpack.base');
const clientDevConfig = require('../config/webpack/webpack.dev.client');
const serverDevConfig = require('../config/webpack/webpack.dev.server');
const clientProdConfig = require('../config/webpack/webpack.prod.client');
const serverProdConfig = require('../config/webpack/webpack.prod.server');
const paths = require('../config/paths');

module.exports = (config, environment = 'development') => {
  const {
   serverPort,
   serverHost,
   hmrPort,
   enableDebug,
   isVerbose,
   reactHotLoader,
   productionPublicPath,
  } = config;

  let clientConfig = clientDevConfig;
  let serverConfig = serverDevConfig;

  let clientOptions = {
    type: 'client',
    serverPort,
    serverHost,
    hmrPort,
    productionPublicPath,
    environment,
    isVerbose,
    enableDebug,
    publicPath: `http://${serverHost}:${hmrPort}/assets/`,
    publicDir: paths.PUBLIC_DIR,
    clientAssetsFile: 'assets.json',
    reactHotLoader,
  };

  if (environment === 'production') {
    clientConfig = clientProdConfig;
    serverConfig = serverProdConfig;

    clientOptions = merge(clientOptions, {
      publicPath: clientOptions.productionPublicPath,
      publicDir: paths.PUBLIC_DIR,
    });
  }
  const serverOptions = merge(clientOptions, {
    type: 'server',
  });

  // Merge options with static webpack configs
  clientConfig = merge.smart(baseConfig(clientOptions), clientConfig(clientOptions));
  serverConfig = merge.smart(baseConfig(serverOptions), serverConfig(serverOptions));

  // Modify via user's config
  try {
    clientConfig = config.editWebpackCfg(cloneDeep(clientConfig), clientOptions);
    serverConfig = config.editWebpackCfg(cloneDeep(serverConfig), serverOptions);
  } catch (error) {
    logger.error('Error in your boldr.config.js editWebpackCfg():', error);
    process.exit(1);
  }

  if (config.debug) {
    logger.debug('Client webpack configuration:', clientConfig);
    logger.debug('\n\n');
    logger.debug('Server webpack configuration:', serverConfig);
  }

  // A "main" entry is required in the server config.
  if (!serverConfig.entry.main) {
    logger.error(
      'A main entry is required in the server configuration. Found: ', serverConfig.entry,
    );
    process.exit(1);
  }

  return {
    clientConfig,
    serverConfig,
  };
};
