/* @flow */
type formatter = () => { errors: string[], warnings: string[] };

const formatWebpackMessages: formatter = require('react-dev-utils/formatWebpackMessages');

class LoggerPlugin {
  logger: LogGroup;

  constructor(logger: LogGroup) {
    this.logger = logger;
  }

  apply(compiler: Object): void {
    compiler.plugin('invalid', () => {
      this.logger.info(`Compiling "${this.logger.getIdentifier()}" bundle...`);
    });

    compiler.plugin('done', stats => {
      const bundleName = this.logger.getIdentifier();
      const formattedMessages = formatWebpackMessages(stats.toJson({}, true));

      const { errors, warnings } = formattedMessages;

      if (errors.length) {
        this.logger.error(`Bundle "${bundleName}" compiled with errors:\n`);
        errors.forEach(error => this.logger.log(error));
        return;
      }

      if (warnings.length) {
        this.logger.warning(`Bundle "${bundleName}" compiled with warnings:\n`);
        warnings.forEach(warning => this.logger.log(warning));
        return;
      }

      if (!errors.length && !warnings.length) {
        this.logger.success(`Bundle "${bundleName}" successfully compiled`);
      }
    });
  }
}

module.exports = LoggerPlugin;