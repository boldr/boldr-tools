/* @flow */
/* eslint-disable require-await */
import path from 'path';
import fs from 'fs-extra';
import appRoot from 'boldr-utils/es/node/appRoot';
import _debug from 'debug';
import webpack from 'webpack';
import terminate from 'terminate';
import logger from 'boldr-utils/es/logger';
import loadConfiguration from './config/loadConfig';

const debug = _debug('boldr:dx:engine');

class Engine {
  cwd: string;
  configFileName: string;
  plugins: Array<PluginController>;

  constructor(inputOptions) {
    this.cwd = appRoot.get();
    this.configFileName = './.boldr/boldr.js';
    this.inputOptions = inputOptions;
  }

  configFilePath(): string {
    return path.resolve(this.cwd, './.boldr/boldr.js');
  }
  getInputOptions() {
    return this.inputOptions;
  }
  getConfiguration(): Config {
    return loadConfiguration(this);
  }
  // determine our NODE_ENV used as the identifier
  getNodeEnv(): string {
    debug('getNodeEnv: ', this.getConfiguration());
    return this.getConfiguration().env.NODE_ENV;
  }

  async build(): Promise<any> {
    const config: Config = loadConfiguration(this);

    const pluginControllers: PluginController[] = await Promise.all(
      config.plugins.map(plugin => plugin(this, true)),
    );

    await Promise.all(
      pluginControllers.map(pluginController => pluginController.build()),
    );
  }

  async start(): Promise<any> {
    const config: Config = loadConfiguration(this);
    debug(this.inputOptions);
    this.plugins = await Promise.all(
      config.plugins.map(plugin => plugin(this, false)),
    );

    await Promise.all(this.plugins.map(p => p.start()));
  }

  async restart(): Promise<any> {
    // terminate all plugins
    await Promise.all(
      this.plugins.map(pluginController => pluginController.end()),
    );

    // start all plugins
    await this.start();
  }

  async stop(): Promise<any> {
    await Promise.all(
      this.plugins.map(pluginController => pluginController.end()),
    );
  }
}

export default Engine;
