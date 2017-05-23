import fs from 'fs';
import logger from 'boldr-utils/es/logger';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import loadConfig from '../config/loadConfig';
import buildDevDlls from '../webpack/plugins/buildDevDlls';
import createBrowserWebpack from '../webpack/webpack.browser.config';
import createNodeWebpack from '../webpack/webpack.node.config';
import createCompiler from '../webpack/createCompiler';

async function task(args, options) {
  logger.info('Loading configuration.');
  const config = loadConfig();

  await buildDevDlls(config);
  const serverConfig = createNodeWebpack({
    config,
    mode: 'development',
    name: 'server',
  });
  const clientConfig = createBrowserWebpack({
    config,
    mode: 'development',
    name: 'client',
  });
  const serverCompiler = createCompiler(serverConfig);
  // Start our server webpack instance in watch mode.
  serverCompiler.watch(
    {
      quiet: true,
      stats: 'none',
    },
    stats => {},
  );
  // Compile our assets with webpack
  const clientCompiler = createCompiler(clientConfig);

  // Create a new instance of Webpack-dev-server for our client assets.
  // This will actually run on a different port than the users app.
  const clientDevServer = new WebpackDevServer(
    clientCompiler,
    clientConfig.devServer,
  );

  clientDevServer.listen(
    (process.env.BOLDR__DEV_PORT &&
      parseInt(process.env.BOLDR__DEV_PORT, 10)) ||
      3001,
    err => {
      if (err) {
        logger.error(err);
      }
    },
  );
}

function register(program) {
  program.command('dev', 'Launch the development process.').action(task);
}

export default { register };
