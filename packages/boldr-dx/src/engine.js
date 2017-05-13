/* @flow */
const path = require('path');
const loadConfiguration = require('./config/loadConfig');

class Engine {
  cwd: string;
  configFileName: string;
  logger: Logger;
  plugins: Array<PluginController>;

  constructor(
    cwd: string,
    configFileName: string = 'boldr.js',
    logger: Logger,
  ) {
    this.cwd = cwd;
    this.configFileName = configFileName;
    this.logger = logger;
  }

  configFilePath(): string {
    return path.resolve(this.cwd, `.boldr/${this.configFileName}`);
  }

  getConfiguration(): Config {
    return loadConfiguration(this);
  }

  getIdentifier(): string {
    return this.getConfiguration().env.NODE_ENV;
  }

  async build(): Promise<any> {
    const config: Config = loadConfiguration(this);

    // run build phase on plugins (do not instantiate them)
    const pluginControllers: PluginController[] = await Promise.all(
      config.plugins.map(plugin => plugin(this, true, this.logger)),
    );

    await Promise.all(
      pluginControllers.map(pluginController => pluginController.build()),
    );
  }

  async start(): Promise<any> {
    const config: Config = loadConfiguration(this);

    // instantiate plugins
    this.plugins = await Promise.all(
      config.plugins.map(plugin => plugin(this, false, this.logger)),
    );

    await Promise.all(this.plugins.map(p => p.start()));
  }

  async restart(): Promise<any> {
    // terminate all plugins
    await Promise.all(
      this.plugins.map(pluginController => pluginController.terminate()),
    );

    // start all plugins
    await this.start();
  }

  async stop(): Promise<any> {
    await Promise.all(
      this.plugins.map(pluginController => pluginController.terminate()),
    );
  }
}

module.exports = Engine;