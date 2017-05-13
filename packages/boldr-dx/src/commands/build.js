/* @flow */
/* eslint-disable global-require, no-console, require-await */
process.env.NODE_ENV = 'production';
import fs from 'fs-extra';
import webpack from 'webpack';

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
): BuildPluginController => {
  let clientLogger, serverLogger, serverCompiler, clientDevServer;
  const { env: envVariables, settings } = engine.getConfiguration();

  return {
    async build() {
      clientLogger = logger.createGroup('client');
      serverLogger = logger.createGroup('server');
      const clientConfig = require('../webpack/browser/webpack.prod.config')(
        engine,
        clientLogger,
      );
      const serverConfig = require('../webpack/node/webpack.prod.config')(
        engine,
        serverLogger,
      );

      fs.removeSync(settings.client.bundleDir);
      fs.removeSync(settings.server.bundleDir);

      const compilers = [
        createRunOnceCompiler(clientConfig),
        createRunOnceCompiler(serverConfig),
      ];

      return Promise.all(compilers);
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
