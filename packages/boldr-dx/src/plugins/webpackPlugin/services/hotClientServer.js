import express from 'express';
import notifier from 'node-notifier';
import devMiddleware from 'webpack-dev-middleware';
import hotMiddleware from 'webpack-hot-middleware';
import historyAPIFallback from 'connect-history-api-fallback';
import _debug from 'debug';
import logger from 'boldr-utils/es/logger';
import ServerListener from './serverListener';

const debug = _debug('boldr:dx:services:hotClient');

class HotClientServer {
  constructor(compiler, config) {
    this.config = config;

    const app = express();

    const httpPathRegex = /^https?:\/\/(.*):([\d]{1,5})/i;
    const httpPath = compiler.options.output.publicPath;

    if (!httpPath.startsWith('http') && !httpPathRegex.test(httpPath)) {
      notifier.notify({
        title: 'Development Error',
        message: 'Development server requires an absolute public path.',
      });
      throw new Error('Development server requires an absolute public path.');
    }

    // eslint-disable-next-line no-unused-vars
    const [_, host, port] = httpPathRegex.exec(httpPath);

    this.webpackDevMiddleware = devMiddleware(compiler, {
      quiet: true,
      noInfo: true,
      lazy: false,
      hot: true,
      watchOptions: {
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

    this.serverListener = new ServerListener(listener, 'web');

    compiler.plugin('compile', () => {
      logger.start('Building new bundle...');
    });

    compiler.plugin('done', stats => {
      if (stats.hasErrors()) {
        debug(stats.toString());
        logger.error('Build failed');
        logger.error(stats.toString());
      } else {
        logger.end('Running with latest changes.');
      }
    });
  }

  shutdown() {
    this.webpackDevMiddleware.close();

    return this.serverListener
      ? this.serverListener.shutdown()
      : Promise.resolve();
  }
}

export default HotClientServer;
