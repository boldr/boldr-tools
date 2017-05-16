/* @flow */
/* eslint-disable global-require, no-console, require-await, babel/new-cap */
import { resolve as pathResolve } from 'path';
import fs from 'fs-extra';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import DevDllPlugin from './plugins/DevDllPlugin';

function createRunOnceCompiler(webpackConfig: Object): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      webpack(webpackConfig, (err, stats) => {
        if (err || stats.hasErrors()) {
          return reject(err);
        }

        return resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}

const plugin: Plugin = (
  engine: Engine,
  runOnce: boolean = false,
  logger: Logger,
): PluginController => {
  let clientLogger, serverLogger, serverCompiler, clientDevServer;
  const { inline: envVariables, settings } = engine.getConfiguration();

  return {
    // build
    // targets = node / web
    // dev = false
    async build() {
      clientLogger = logger.createGroup('client');
      serverLogger = logger.createGroup('server');

      const clientConfig = require('./browser/webpack.prod.config')(
        engine,
        clientLogger,
      );

      const serverConfig = require('./node/webpack.prod.config')(
        engine,
        serverLogger,
      );

      fs.removeSync(settings.bundle.client.bundleDir);
      fs.removeSync(settings.bundle.server.bundleDir);

      const compilers = [
        createRunOnceCompiler(clientConfig),
        createRunOnceCompiler(serverConfig),
      ];

      return Promise.all(compilers);
    },
    // start
    // targets = node / web
    // dev = true
    async start() {
      clientLogger = logger.createGroup('client');
      serverLogger = logger.createGroup('server');
      await DevDllPlugin(engine);
      const clientConfig = require('./browser/webpack.dev.config')(
        engine,
        clientLogger,
      );
      const serverConfig = require('./node/webpack.dev.config')(
        engine,
        serverLogger,
      );
      return new Promise((resolve, reject) => {
        try {
          clientConfig.plugins.push(
            new webpack.DllReferencePlugin({
              // $FlowFixMe
              manifest: require(pathResolve(
                settings.assetsDir,
                '__vendor_dlls__.json',
              )),
            }),
          );
          const clientCompiler = webpack(clientConfig);

          clientDevServer = new WebpackDevServer(
            clientCompiler,
            clientConfig.devServer,
          );

          clientDevServer.listen(envVariables.DEV_SERVER_PORT, err => {
            if (err) {
              console.log(err);
              return reject(err);
            }
          });

          serverCompiler = webpack({
            ...serverConfig,
            watchOptions: {
              ignored: /node_modules/,
            },
          }).watch({}, () => {});
        } catch (e) {
          reject(e);
        }

        resolve();
      });
    },

    async terminate() {
      clientLogger.remove();
      serverLogger.remove();

      if (serverCompiler) {
        return Promise.all([
          new Promise(resolve => serverCompiler.close(resolve)),
          new Promise(resolve => clientDevServer.close(resolve)),
        ]);
      }

      return true;
    },
  };
};

module.exports = plugin;
