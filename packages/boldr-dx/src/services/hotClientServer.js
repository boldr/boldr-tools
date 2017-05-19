import express from 'express';
import devMiddleware from 'webpack-dev-middleware';
import hotMiddleware from 'webpack-hot-middleware';
import historyAPIFallback from 'connect-history-api-fallback';
import _debug from 'debug';
import logger from 'boldr-utils/es/logger';
import ListenerManager from './listenerManager';

const debug = _debug('boldr:dx:services:hotClient');

class HotClientServer {
  constructor(compiler, config) {
    this.config = config;

    const app = express();

    const httpPathRegex = /^https?:\/\/(.*):([\d]{1,5})/i;
    const httpPath = compiler.options.output.publicPath;
    debug('httpPath', httpPath);
    if (!httpPath.startsWith('http') && !httpPathRegex.test(httpPath)) {
      throw new Error(
        `You must supply an absolute public path to a development build`,
      );
    }

    // eslint-disable-next-line no-unused-vars
    const [_, host, port] = httpPathRegex.exec(httpPath);

    this.webpackDevMiddleware = devMiddleware(compiler, {
      quiet: true,
      noInfo: true,
      lazy: false,
      hot: true,
      watchOptions: {
        aggregateTimeout: 300,
        poll: true,
        ignored: /node_modules/,
      },
      stats: {
        colors: true,
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      publicPath: compiler.options.output.publicPath,
    });
    app.use(historyAPIFallback());
    app.use(this.webpackDevMiddleware);
    app.use(hotMiddleware(compiler, { log: debug, heartbeat: 10 * 1000 }));
    const devPort = parseInt(config.env.BOLDR__DEV_PORT, 10);
    const listener = app.listen(devPort, host);

    this.listenerManager = new ListenerManager(listener, 'web');

    compiler.plugin('compile', () => {
      logger.start('Building new bundle...');
    });

    compiler.plugin('done', stats => {
      if (stats.hasErrors()) {
        logger.error('Build failed, please check the console for more info.');
        debug(stats.toString());
      } else {
        logger.end('Running with latest changes.');
      }
    });
  }

  dispose() {
    this.webpackDevMiddleware.close();

    return this.listenerManager
      ? this.listenerManager.dispose()
      : Promise.resolve();
  }
}

export default HotClientServer;
