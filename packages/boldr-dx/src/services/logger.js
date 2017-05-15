/* @flow */
/* eslint-disable no-console */
import LogGroup from '../utils/logGroup';

class Logger {
  groups: Array<LogGroup>;

  constructor() {
    this.groups = [];
  }

  createGroup(name: string): LogGroup {
    if (this.groups.find(group => group.getIdentifier() === name)) {
      throw new Error(`Log group "${name}" already exists`);
    }

    const group = new LogGroup(name, this);
    this.groups.push(group);

    return group;
  }

  removeGroup(name: string): void {
    this.groups = this.groups.filter(group => group.getIdentifier() !== name);
    this.render();
  }

  /**
   * Renders logs to console
   */
  render() {
    this.groups.forEach((group: LogGroup) => {
      // no messages for this group
      if (!group.getMessages().length) {
        return;
      }

      group.getMessages().forEach(message => {
        console.log(message);
        console.log();
      });

      // aesthetic
      console.log('');
    });
  }
}

module.exports = Logger;
