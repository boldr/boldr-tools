import path from 'path';
import { spawn } from 'child_process';
import logger from 'boldr-utils/es/logger';
import _debug from 'debug';
import appRoot from '../utils/appRoot';

const debug = _debug('boldr:dx:services:hotNode');

class HotNodeServer {
  constructor(name, compiler, clientCompiler) {
    const compiledEntryFile = path.resolve(
      appRoot.get(),
      compiler.options.output.path,
      `${Object.keys(compiler.options.entry)[0]}.js`,
    );

    const startServer = () => {
      if (this.server) {
        this.server.kill();
        this.server = null;
        logger.info('Restarting server...');
      }

      const newServer = spawn('node', [compiledEntryFile, '--colors'], {
        stdio: [process.stdin, process.stdout, 'pipe'],
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

      if (this.disposing) {
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

  dispose() {
    this.disposing = true;

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

export default HotNodeServer;
