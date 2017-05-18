/* @flow */
/* eslint-disable require-await */
import path from 'path';
import fs from 'fs-extra';
import _debug from 'debug';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import logger from 'boldr-utils/es/logger';
import loadConfiguration from './config/loadConfig';
import compileOnce from './services/compileOnce';
import buildDevDlls from './webpack/plugins/buildDevDlls';
import configBuilder from './webpack/configBuilder';

const debug = _debug('boldr:dx:engine');

class Engine {
  cwd: string;
  configFileName: string;
  plugins: Array<PluginController>;

  constructor(cwd: string, configFileName: string = 'boldr.js') {
    this.cwd = cwd;
    this.configFileName = configFileName;
  }

  configFilePath(): string {
    return path.resolve(this.cwd, `.boldr/${this.configFileName}`);
  }

  getConfiguration(): Config {
    return loadConfiguration(this);
  }
  // determine our NODE_ENV used as the identifier
  getIdentifier(): string {
    return this.getConfiguration().env.NODE_ENV;
  }

  buildDlls(config: Config) {
    return buildDevDlls(config);
  }

  async build(): Promise<any> {
    const config: Config = loadConfiguration(this);

    const clientConfig = configBuilder(config, 'production', 'web');
    const serverConfig = configBuilder(config, 'production', 'node');

    fs.removeSync(config.bundle.client.bundleDir);
    fs.removeSync(config.bundle.server.bundleDir);

    const compilers = [compileOnce(clientConfig), compileOnce(serverConfig)];

    return Promise.all(compilers);
  }

  async start(): Promise<any> {
    logger.start('Starting development bundling process.');
    let serverCompiler, clientDevServer;
    const config: Config = loadConfiguration(this);
    // instantiate plugins
    // eslint-disable-next-line babel/new-cap
    await this.buildDlls(config);
    const clientConfig = configBuilder(config, 'development', 'web');
    const serverConfig = configBuilder(config, 'development', 'async-node');

    return new Promise((resolve, reject) => {
      try {
        clientConfig.plugins.push(
          new webpack.DllReferencePlugin({
            // $FlowFixMe
            manifest: require(path.resolve(
              config.bundle.assetsDir,
              '__vendor_dlls__.json',
            )),
          }),
        );
        const clientCompiler = webpack(clientConfig);
        const BOLDR__DEV_PORT =
          parseInt(config.env.BOLDR__DEV_PORT, 10) || 3001;

        clientDevServer = new WebpackDevServer(clientCompiler, {
          clientLogLevel: 'none',
          disableHostCheck: true,
          contentBase: config.bundle.publicDir,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
          historyApiFallback: {
            // Paths with dots should still use the history fallback.
            // See https://github.com/facebookincubator/create-react-app/issues/387.
            disableDotRule: true,
          },
          compress: true,
          host: 'localhost',
          port: BOLDR__DEV_PORT,
          hot: true,
          publicPath: config.bundle.webPath,
          quiet: true,
          noInfo: true,
          watchOptions: {
            poll: true,
            ignored: /node_modules/,
          },
        });

        clientDevServer.listen(BOLDR__DEV_PORT, err => {
          if (err) {
            console.log(err);
            return reject(err);
          }
        });

        serverCompiler = webpack({
          ...serverConfig,
          watchOptions: {
            poll: true,
            ignored: /node_modules/,
          },
        }).watch({}, () => {});
      } catch (e) {
        return reject(e);
      }

      return resolve();
    });
  }

  async restart(): Promise<any> {
    let clientLogger, serverLogger, serverCompiler, clientDevServer;
    if (serverCompiler) {
      return Promise.all([
        // $FlowIssue
        new Promise(resolve => serverCompiler.close(resolve)),
        new Promise(resolve => clientDevServer.close(resolve)),
      ]);
    }

    // start all plugins
    await this.start();
  }

  async stop(): Promise<any> {
    let clientLogger, serverLogger, serverCompiler, clientDevServer;
    if (serverCompiler) {
      return Promise.all([
        // $FlowIssue
        new Promise(resolve => serverCompiler.close(resolve)),
        new Promise(resolve => clientDevServer.close(resolve)),
      ]);
    }

    return true;
  }
}

export default Engine;
