/* eslint-disable max-lines, max-statements, camelcase, no-new */

import path from 'path';
import spawn from 'cross-spawn';
import fs from 'fs-extra';
import chalk from 'chalk';
import shell from 'shelljs';
import logger from 'boldr-utils/lib/logger';
import spinner from '../util/spinner';

const simpleGit = require('simple-git')();

const ROOT_DIR = process.cwd();
const apiRepoUrl = 'https://github.com/boldr/boldr-api.git';
const projectDir = path.resolve(ROOT_DIR, 'boldr');
const apiDir = path.resolve(ROOT_DIR, 'boldr-api');

const nukeApi = () => shell.rm('-rf', apiDir);
// const DEFAULT_OPTIONS = {
//   pkgMgr: 'yarn',
// };

export default class ApiSetup {
  constructor(options = {}) {
    this.setOptions(options);
    this.init();
  }

  setOptions(options) {
    this.options = {
      // ...DEFAULT_OPTIONS,
      ...options,
    };
  }
  init() {
    this.initStructure();
  }

  initStructure() {
    spinner.start();
    logger.start('Initializing a new Boldr API project.');
    shell.mkdir(apiDir);
    spinner.succeed(chalk.green(` Created ${apiDir}`));
    shell.cd(apiDir);
    spinner.start();
    logger.task('Getting Boldr API project files...');
    simpleGit.clone(apiRepoUrl, apiDir, {}, this.initFiles(this.options));
  }
  initFiles() {
    spinner.succeed(chalk.green(' Got the files'));
    logger.task('Installing...');
    let result;
    if (this.options.packageManager === 'yarn') {
      result = spawn.sync('yarn', ['install'], { stdio: 'inherit' });
    } else {
      result = spawn.sync('npm', ['install'], { stdio: 'inherit' });
    }

    if (result.status !== 0) {
      logger.error('Installation failed...');
      process.exit(1);
    }
    logger.end(chalk.green('Installation complete.'));
    process.exit(0);
  }
}
