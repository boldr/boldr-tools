import shell from 'shelljs';
import { logger } from 'boldr-utils';

const printAssets = require('../../utils/printAssets');
const compileConfigs = require('../../utils/compileConfigs');
const webpackCompiler = require('../../utils/webpackCompiler');
const paths = require('../../config/paths');

module.exports = (config) => {
  logger.start('Starting production build...');

  let serverCompiler;

  const {
    clientConfig,
    serverConfig,
  } = compileConfigs(config, 'production');

  // Empty assets
  if (shell.rm('-rf', paths.assetsDir).code === 0) {
    shell.mkdir(paths.assetsDir);
    logger.task('Purged assets directory.');
  }
  // Empty compiled
  if (shell.rm('-rf', paths.compiledDir).code === 0) {
    shell.mkdir(paths.compiledDir);
    logger.task('Purged compiled server directory.');
  }

  // Compiles server code using the prod.server config
  const buildServer = () => {
    serverCompiler = webpackCompiler(serverConfig, (stats) => {
      if (stats.hasErrors()) process.exit(1);
      logger.end('Built server.');
    });
    serverCompiler.run(() => undefined);
  };

  const clientCompiler = webpackCompiler(clientConfig, (stats) => {
    if (stats.hasErrors()) process.exit(1);
    logger.info('Assets:');
    printAssets(stats, clientConfig);
    buildServer();
  });
  clientCompiler.run(() => undefined);
};
