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
const cmsRepoUrl = 'https://github.com/strues/boldr.git';
const projectDir = path.resolve(process.cwd(), 'boldr');
const cmsDir = path.resolve(projectDir, './boldr-cms');
const apiDir = path.resolve(projectDir, './boldr-api');

// const DEFAULT_OPTIONS = {
//   pkgMgr: 'yarn',
// };
export default class FullSetup {
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
    this.initProjectDir();
    this.initCms();
    this.initApi();
  }
  initProjectDir() {
    logger.start('Initializing a new Boldr project.');
    shell.mkdir(projectDir);
    shell.cd(projectDir);
  }
  initCms() {
    spinner.start();
    logger.task('Setting up your Boldr CMS project.');
    logger.task('Getting Boldr CMS project files...');
    simpleGit.clone(cmsRepoUrl, cmsDir, {}, this.installCms(this.options));
    spinner.succeed(chalk.green(' Got the files'));
  }
  installCms() {
    shell.cd(cmsDir);
    logger.task('Installing...');
    spinner.start();
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
    spinner.succeed(chalk.green('CMS Installation complete.'));
  }
  initApi() {
    spinner.start();
    logger.task('Setting up your Boldr API project.');
    logger.task('Getting Boldr API project files...');
    simpleGit.clone(apiRepoUrl, apiDir, {}, this.installApi(this.options));
    spinner.succeed(chalk.green(' Got the files'));
  }
  installApi() {
    shell.cd(apiDir);
    logger.task('Installing...');
    spinner.start();
    let result;
    if (this.options.packageManager === 'yarn') {
      result = spawn.sync('yarn', ['install'], { stdio: 'inherit' });
    } else {
      result = spawn.sync('npm', ['install'], { stdio: 'inherit' });
    }

    if (result.status !== 0) {
      logger.error('💩  Installation failed...');
      process.exit(1);
    }
    spinner.succeed();
    logger.end(chalk.green('API Installation complete.'));
  }
}
