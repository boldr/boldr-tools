/* eslint-disable require-await */
import path from 'path';
import execa from 'execa';
import notifier from 'node-notifier';
import logger from 'boldr-utils/es/logger';
import appRoot from 'boldr-utils/es/node/appRoot';
import _debug from 'debug';

const debug = _debug('boldr:dx:services:hotNode');

class HotNodeServer {
  constructor(compiler, clientCompiler) {
    const compiledEntryFile = path.resolve(
      appRoot.get(),
      compiler.options.output.path,
      'server.js',
    );

    const startServer = async () => {
      await this.prepareMiddlewares(compiler);
      if (this.server) {
        this.server.kill();
        this.server = null;
        logger.info('Restarting server...');
      }

      const newServer = execa(
        'node',
        [compiledEntryFile, '--colors', '--inspect', '--trace-warnings'],
        {
          stdio: [process.stdin, process.stdout, 'pipe'],
        },
      );
      notifier.notify({
        title: '[Boldr] Server Online',
        message: 'Development server online and ready.',
      });
      logger.end('Server running with latest changes.');

      newServer.stderr.on('data', data => {
        process.stderr.write('\n');
        process.stderr.write(data);
        process.stderr.write('\n');
      });
      this.server = newServer;
    };

    const waitForClientThenStartServer = () => {
      if (this.serverCompiling) {
        return;
      }
      if (this.clientCompiling) {
        setTimeout(waitForClientThenStartServer, 40);
      } else {
        startServer();
      }
    };

    clientCompiler.plugin('compile', () => {
      logger.start('Building a new client bundle...');
      this.clientCompiling = true;
    });

    clientCompiler.plugin('done', stats => {
      logger.end('Client bundle compiled.');
      if (!stats.hasErrors()) {
        this.clientCompiling = false;
      }
    });

    compiler.plugin('compile', () => {
      this.serverCompiling = true;
      logger.start('Building a new server bundle...');
    });

    compiler.plugin('done', stats => {
      this.serverCompiling = false;

      if (this.exiting) {
        return;
      }

      try {
        if (stats.hasErrors()) {
          logger.error('Build failed, check the console for more information.');
          debug(stats.toString());
          return;
        }

        waitForClientThenStartServer();
      } catch (err) {
        logger.error(
          'Failed to start, check the console for more information.',
        ); // eslint-disable-line
        debug(err);
      }
    });

    // Lets start the compiler.
    this.watcher = compiler.watch(null, () => undefined);
  }
  async prepareMiddlewares(compiler) {
    compiler.plugin('after-emit', (compilation, callback) => {
      const { assets } = compilation;
      if (this.prevAssets) {
        for (const f of Object.keys(assets)) {
          deleteCache(assets[f].existsAt);
        }
        for (const f of Object.keys(this.prevAssets)) {
          if (!assets[f]) {
            deleteCache(this.prevAssets[f].existsAt);
          }
        }
      }
      this.prevAssets = assets;

      callback();
    });
  }
  shutdown() {
    this.exiting = true;

    const stopWatcher = new Promise(resolve => {
      this.watcher.close(resolve);
    });

    return stopWatcher.then(() => {
      if (this.server) {
        this.server.kill();
      }
    });
  }
}

function deleteCache(path) {
  delete require.cache[path];
}

export default HotNodeServer;
