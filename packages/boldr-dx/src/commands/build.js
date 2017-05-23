import fs from 'fs-extra';
import logger from 'boldr-utils/es/logger';
import webpack from 'webpack';
import loadConfig from '../config/loadConfig';
import createBrowserWebpack from '../webpack/webpack.browser.config';
import createNodeWebpack from '../webpack/webpack.node.config';
import createSingleCompiler from '../webpack/createSingleCompiler';

function task(args, options) {
  logger.info('Loading configuration.');
  const config = loadConfig();

  const clientConfig = createBrowserWebpack({
    config,
    mode: 'production',
    name: 'client',
  });
  const serverConfig = createNodeWebpack({
    config,
    mode: 'production',
    name: 'server',
  });

  fs.removeSync(config.bundle.client.bundleDir);
  fs.removeSync(config.bundle.server.bundleDir);

  const compilers = [
    createSingleCompiler(clientConfig),
    createSingleCompiler(serverConfig),
  ];

  return Promise.all(compilers).then(() => process.exit(0));
}

function register(program) {
  program
    .command('build', 'Compile the browser and server bundles for production.')
    .action(task);
}

export default { register };
