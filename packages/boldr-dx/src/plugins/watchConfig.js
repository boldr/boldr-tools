/* @flow */
/* eslint-disable require-await */
import path from 'path';
import chokidar from 'chokidar';
import logger from 'boldr-utils/es/logger';

function createUpdater(engine: Engine) {
  return (filePath: string) => {
    // eslint-disable-line no-unused-vars
    logger.task(
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
): PluginController => {
  let watcher;

  return {
    async build() {
      return Promise.resolve();
    },

    async start() {
      return new Promise((resolve, reject) => {
        logger.start('Watching configuration');
        const updater = createUpdater(engine);

        // start chokidar and watch for .boldr/boldr.js changes
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
          logger.error('Watch configuration plugin failed');
          logger.error(error);

          reject(error);
        });
      });
    },

    async terminate() {
      logger.end('Finished watching config.');
      watcher.close();
    },
  };
};

module.exports = plugin;
