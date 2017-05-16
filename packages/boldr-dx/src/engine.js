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
import DevDllPlugin from './webpack/plugins/DevDllPlugin';
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
    return this.getConfiguration().inline.NODE_ENV;
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
    await DevDllPlugin(config);
    const clientConfig = configBuilder(config, 'development', 'web');
    const serverConfig = configBuilder(config, 'development', 'node');

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
        clientDevServer = new WebpackDevServer(
          clientCompiler,
          clientConfig.devServer,
        );

        clientDevServer.listen(3001, err => {
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
