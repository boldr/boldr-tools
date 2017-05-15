/* @flow */
import chalk from 'chalk';
import clearConsole from 'react-dev-utils/clearConsole';

class LogGroup {
  logger: Logger;
  messages: Array<string>;
  name: string;

  constructor(name: string, logger: Logger) {
    this.name = name;
    this.logger = logger;
    this.messages = [];
  }

  clear(): void {
    this.messages = [];
    this.logger.render();
  }

  log(message: string): void {
    this.messages.push(message);
    this.logger.render();
  }

  info(message: string): void {
    this.log(`⚡  ${message}`);
  }

  success(message: string): void {
    this.log(`👌  ${message}`);
  }

  warning(message: string): void {
    this.log(`⚠️  ${message}`);
  }

  error(message: string): void {
    this.log(`💩  ${message}`);
  }

  getMessages(): string[] {
    return this.messages;
  }

  getIdentifier(): string {
    return this.name;
  }

  remove(): void {
    clearConsole();
    this.logger.removeGroup(this.name);
  }
}

module.exports = LogGroup;
