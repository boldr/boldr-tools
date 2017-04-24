import shell from 'shelljs';
import logger from 'boldr-utils/es/logger';

import printAssets from '../services/printAssets';
import compileConfigs from '../services/compileConfigs';
import webpackCompiler from '../services/webpackCompiler';
import paths from '../config/paths';

module.exports = config => {
  logger.start('Starting production build...');

  let serverCompiler;

  const {clientConfig, serverConfig} = compileConfigs(config, 'production');

  // Empty assets
  if (shell.rm('-rf', paths.clientOutputPath).code === 0) {
    shell.mkdir(paths.clientOutputPath);
    logger.task('Purged assets directory.');
  }
  // Empty compiled
  if (shell.rm('-rf', paths.serverOutputPath).code === 0) {
    shell.mkdir(paths.serverOutputPath);
    logger.task('Purged compiled server directory.');
  }

  // Compiles server code using the prod.server config
  const buildServer = () => {
    serverCompiler = webpackCompiler(serverConfig, stats => {
      if (stats.hasErrors()) {
        process.exit(1);
      }
      logger.end('Built server.');
    });
    serverCompiler.run(() => undefined);
  };

  const clientCompiler = webpackCompiler(clientConfig, stats => {
    if (stats.hasErrors()) {
      process.exit(1);
    }
    logger.info('Assets:');
    printAssets(stats, clientConfig);
    buildServer();
  });
  clientCompiler.run(() => undefined);
};
