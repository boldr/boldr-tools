/* @flow */
/* eslint-disable global-require, no-console, require-await */
import fs from 'fs-extra';
import webpack from 'webpack';
import openBrowser from 'react-dev-utils/openBrowser';
import WebpackDevServer from 'webpack-dev-server';

const configurations = {
  client: {
    development: require('./browser/webpack.dev.config'),
    production: require('./browser/webpack.prod.config'),
  },
  server: {
    development: require('./node/webpack.dev.config'),
    production: require('./node/webpack.prod.config'),
  },
};

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
  const { env: envVariables, settings } = engine.getConfiguration();

  return {
    async build() {
      clientLogger = logger.createGroup('client');
      serverLogger = logger.createGroup('server');
      const clientConfig = configurations.client[engine.getIdentifier()](
        engine,
        clientLogger,
      );
      const serverConfig = configurations.server[engine.getIdentifier()](
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

    async start() {
      clientLogger = logger.createGroup('client');
      serverLogger = logger.createGroup('server');
      const clientConfig = configurations.client[engine.getIdentifier()](
        engine,
        clientLogger,
      );
      const serverConfig = configurations.server[engine.getIdentifier()](
        engine,
        serverLogger,
      );

      return new Promise((resolve, reject) => {
        try {
          const clientCompiler = webpack(clientConfig);

          clientDevServer = new WebpackDevServer(clientCompiler, {
            clientLogLevel: 'none',
            contentBase: envVariables.PUBLIC_DIR,
            historyApiFallback: {
              disableDotRule: true,
            },
            https: settings.client.protocol === 'https',
            host: 'localhost',
            hot: true,
            proxy: {
              '!(/__webpack_hmr|**/*.*)': `http://localhost:${envVariables.SERVER_PORT}`,
            },
            publicPath: '/',
            quiet: true,
            watchOptions: {
              ignored: /node_modules/,
            },
          });

          clientDevServer.listen(envVariables.SERVER_PORT - 1, err => {
            if (err) {
              console.log(err);
              return reject(err);
            }

            return openBrowser(
              `${settings.client.protocol || 'http'}://localhost:${envVariables.SERVER_PORT - 1}/`,
            );
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
