import cluster from 'cluster';
import logger from 'boldr-utils/es/logger';

export default class ServerListenerPlugin {
  constructor(options) {
    // eslint-disable-next-line eqeqeq
    if (options == null) {
      options = {};
    }
    if (typeof options === 'string') {
      options = { name: options };
    }
    this.options = options;
    this.afterEmit = this.afterEmit.bind(this);
    this.apply = this.apply.bind(this);
    this.startServer = this.startServer.bind(this);

    this.worker = null;
  }

  _getArgs() {
    const { options } = this;
    const execArgv = (options.nodeArgs || []).concat(process.execArgv);
    if (options.args) {
      execArgv.push('--');
      execArgv.push.apply(execArgv, options.args);
    }
    return execArgv;
  }

  afterEmit(compilation, callback) {
    if (this.worker && this.worker.isConnected()) {
      return callback();
    }

    this.startServer(compilation, callback);
  }

  apply(compiler) {
    compiler.plugin('after-emit', this.afterEmit);
  }

  startServer(compilation, callback) {
    const { options } = this;
    let name;
    const names = Object.keys(compilation.assets);
    if (options.name) {
      // eslint-disable-next-line prefer-destructuring
      name = options.name;
      if (!compilation.assets[name]) {
        logger.error(`Entry ${name} was not found. Try ${names.join(' ')}`);
      }
    } else {
      name = names[0];
      if (names.length > 1) {
        logger.info(
          `More than one entry built, selected ${name}. \n
          All names: ${names.join(' ')}`,
        );
      }
    }
    const { existsAt } = compilation.assets[name];
    const execArgv = this._getArgs();

    cluster.setupMaster({ exec: existsAt, execArgv });

    cluster.on('online', worker => {
      this.worker = worker;
      callback();
    });

    cluster.fork();
  }
}

module.exports = ServerListenerPlugin;
