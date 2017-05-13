/* @flow */
/* eslint-disable require-await */
import path from 'path';
import chokidar from 'chokidar';

function createUpdater(engine: Engine, logger: LogGroup) {
  return (filePath: string) => {
    // eslint-disable-line no-unused-vars
    logger.clear();
    logger.info(
      'Detected change in configuration file, restarting environment...',
    );
    // restart environment (terminates all plugins and loads them again)
    engine.restart();
  };
}

/**
 * Watches configuration file and restarts build on change
 *
 * @param {Object} engine
 * @param {boolean} runOnce   run only once (used in build script)
 * @param {Logger} logger
 */
const plugin: Plugin = (
  engine: Engine,
  runOnce: boolean = false,
  logger: Logger,
): PluginController => {
  let logGroup, watcher;

  return {
    async build() {
      return Promise.resolve();
    },

    async start() {
      return new Promise((resolve, reject) => {
        logGroup = logger.createGroup('watch configuration');
        const updater = createUpdater(engine, logGroup);

        logGroup.clear();

        // start chokidar and watch for .app.js changes
        // everytime configuration changes, restart whole build
        watcher = chokidar.watch(
          `${path.resolve(engine.cwd, './.boldr/boldr.js')}`,
          {
            cwd: engine.cwd,
          },
        );

        watcher.on('ready', () => {
          ['add', 'change', 'unlink'].forEach(event =>
            watcher.on(event, updater),
          );
          resolve();
        });

        watcher.on('error', error => {
          logGroup.clear();
          logGroup.error('Watch configuration plugin failed');
          logGroup.error(error);

          reject(error);
        });
      });
    },

    async terminate() {
      logGroup.remove();
      watcher.close();
    },
  };
};

module.exports = plugin;
