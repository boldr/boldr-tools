/* eslint-disable max-lines, max-statements, camelcase, no-new */

import path from 'path';
import spawn from 'cross-spawn';
import fs from 'fs-extra';
import chalk from 'chalk';
import shell from 'shelljs';
import logger from 'boldr-utils/es/logger';
import spinner from '../util/spinner';

const simpleGit = require('simple-git')();

const ROOT_DIR = process.cwd();
const cmsRepoUrl = 'https://github.com/strues/boldr.git';
const projectDir = path.resolve(ROOT_DIR, 'boldr');
const cmsDir = path.resolve(ROOT_DIR, 'boldr-cms');

// const DEFAULT_OPTIONS = {
//   pkgMgr: 'yarn',
// };

export default class CmsSetup {
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
    const { pkgMgr } = this.options;
    spinner.start();
    logger.start('Initializing a new Boldr CMS project.');
    shell.mkdir(cmsDir);
    spinner.succeed(chalk.green(` Created ${cmsDir}`));
    shell.cd(cmsDir);
    clogger.task('Getting Boldr CMS project files...');
    simpleGit.clone(cmsRepoUrl, cmsDir, {}, this.initFiles(this.options));
    spinner.succeed(chalk.green(' Got the files'));
  }
  initFiles() {
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
