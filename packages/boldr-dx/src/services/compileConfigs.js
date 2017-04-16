import path from 'path';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'webpack-merge';
import shell from 'shelljs';
import webpack from 'webpack';
import logger from 'boldr-utils/es/logger';

import baseConfig from '../webpack/webpack.base';
import clientDevConfig from '../webpack/webpack.dev.client';
import serverDevConfig from '../webpack/webpack.dev.server';
import clientProdConfig from '../webpack/webpack.prod.client';
import serverProdConfig from '../webpack/webpack.prod.server';
import paths from '../config/paths';

module.exports = (config, environment = 'development') => {
  const {
    serverPort,
    serverHost,
    hmrPort,
    isDebug,
    isVerbose,
    serveAssetsFrom,
  } = config;

  let clientConfig = clientDevConfig;
  let serverConfig = serverDevConfig;

  let clientOptions = {
    type: 'client',
    serverPort,
    serverHost,
    hmrPort,
    serveAssetsFrom,
    environment,
    isVerbose,
    isDebug,
    publicPath: `http://${serverHost}:${hmrPort}/assets/`,
    publicDir: paths.publicDir,
    clientAssetsFile: 'assets.json',
  };

  if (environment === 'production') {
    clientConfig = clientProdConfig;
    serverConfig = serverProdConfig;

    clientOptions = merge(clientOptions, {
      publicPath: clientOptions.serveAssetsFrom,
      publicDir: paths.publicDir,
    });
  }
  const serverOptions = merge(clientOptions, {
    type: 'server',
  });

  // Merge options with static webpack configs
  clientConfig = merge.smart(
    baseConfig(clientOptions),
    clientConfig(clientOptions),
  );
  serverConfig = merge.smart(
    baseConfig(serverOptions),
    serverConfig(serverOptions),
  );

  // Modify via user's config
  try {
    clientConfig = config.editWebpackCfg(
      cloneDeep(clientConfig),
      clientOptions,
    );
    serverConfig = config.editWebpackCfg(
      cloneDeep(serverConfig),
      serverOptions,
    );
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
      'A main entry is required in the server configuration. Found: ',
      serverConfig.entry,
    );
    process.exit(1);
  }

  return {
    clientConfig,
    serverConfig,
  };
};
