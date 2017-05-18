/* @flow */
/* eslint-disable no-console, id-match, no-multi-assign */
import path from 'path';
import logger from 'boldr-utils/es/logger';
import _debug from 'debug';

const debug = _debug('boldr:dx:serverlistener');

class ServerManager {
  server: ?net$Server;
  socketId: number;
  sockets: { [key: string]: net$Socket };

  constructor() {
    this.socketId = 0;
    this.sockets = {};
  }

  async manage(server: ?net$Server) {
    if (this.server) {
      await this.close();
    }

    this.server = server;

    if (!this.server) {
      logger.error('Server bundle did not export a http listener');
      logger.info(
        'Please export a http listener using `export default` syntax',
      );

      throw new Error('Server bundle did not export a http listener.');
    } else if (typeof this.server.on !== 'function') {
      const message =
        'Cannot attach connection handler to listener because it is missing an `on` method';
      logger.error(message);

      throw new Error(message);
    }

    this.server.unref();

    const on = this.server ? this.server.on.bind(this.server) : () => {};

    // listen to all connections so we can destroy them on restart
    on('connection', (socket: net$Socket) => {
      socket.unref();

      const socketId = (this.socketId = this.socketId + 1);
      this.sockets[socketId.toString()] = socket;

      socket.on('close', () => delete this.sockets[socketId.toString()]);
    });
  }

  async close() {
    if (this.server) {
      Object.keys(this.sockets).forEach(socketId => {
        const socket = this.sockets[socketId.toString()];
        socket.destroy();
      });
      this.sockets = {};
      const close = this.server
        ? this.server.close.bind(this.server)
        : cb => cb();

      await new Promise(resolve => close(resolve));

      this.server = null;
    }
  }
}

const sharedServerManager = new ServerManager();

module.exports = class ServerListenerPlugin {
  config: Engine;
  target: string;
  serverManager: Object;

  constructor(
    config: Engine,
    target: string,
    serverManager: ServerManager = sharedServerManager,
  ) {
    this.config = config;
    this.serverManager = serverManager;
    this.target = target;

    process.on('SIGINT', () => {
      this.serverManager.close();
    });
  }

  apply(compiler: Object): void {
    compiler.plugin('done', async stats => {
      const bundleName = this.target;

      if (stats.hasErrors()) {
        logger.error(
          `Bundle "${bundleName}" compiled with errors, keeping previous server instance running`,
        );
        logger.error(`${JSON.stringify(stats.toJson({}, true), undefined, 4)}`);
        return;
      }

      // Clear out all files from this build
      Object.keys(require.cache).forEach(modulePath => {
        if (modulePath.indexOf(compiler.options.output.path) === 0) {
          delete require.cache[modulePath];
        }
      });

      const serverBuildPath = path.resolve(
        this.config.bundle.server.bundleDir,
        'app.js',
      );
      await this.serverManager.close();

      // start server
      try {
        // const shouldOpenBrowser = !this.runningServer;

        const server = require(serverBuildPath).default; // eslint-disable-line global-require, max-len

        await this.serverManager.manage(server);

        const port = this.config.server.port;
        const url = `http://localhost:${port}`;

        logger.info(`\tServer is listening on ${url}`);
      } catch (e) {
        logger.error('Error during server bundle start/restart');
        logger.log(e);

        throw e;
      }
    });
  }
};
