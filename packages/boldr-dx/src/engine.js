/* @flow */
/* eslint-disable require-await */
import path from 'path';
import fs from 'fs-extra';
import _debug from 'debug';
import webpack from 'webpack';
import terminate from 'terminate';
import logger from 'boldr-utils/es/logger';
import loadConfiguration from './config/loadConfig';
import compileOnce from './services/compileOnce';
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

  async build(): Promise<any> {
    const config: Config = loadConfiguration(this);

    const clientConfig = configBuilder({
      config,
      mode: 'production',
      target: 'web',
    });
    const serverConfig = configBuilder({
      config,
      mode: 'production',
      target: 'async-node',
    });

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
    const HotDevelopment = require('./services/hotDevelopment').default;

    // Create a new development devServer.
    const devServer = new HotDevelopment(config);
    process.on(
      'SIGTERM',
      () =>
        devServer &&
        devServer.dispose().then(() => {
          process.exit(0);
        }),
    );
  }

  async restart(): Promise<any> {
    let clientLogger, serverLogger, serverCompiler, clientDevServer;
    if (serverCompiler) {
      terminate(process.pid, err => {
        if (err) {
          console.log('Oopsy: ' + err);
        } else {
          console.log('done');
        }
      });
    }

    // start all plugins
    await this.start();
  }

  async stop(): Promise<any> {
    terminate(process.pid, err => {
      if (err) {
        console.log('Oopsy: ' + err);
      } else {
        console.log('done');
      }
    });
  }
}

export default Engine;
