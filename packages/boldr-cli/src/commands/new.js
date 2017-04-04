/* eslint-disable max-lines */
/* eslint-disable max-statements */
/* eslint-disable camelcase */
/* eslint-disable no-new */
/* eslint-disable babel/new-cap */
const path = require('path');
const Promise = require('bluebird');
const spawn = require('cross-spawn');
const fs = require('fs-extra');
const ora = require('ora');
const shell = require('shelljs');
const inquire = require('inquirer');
const uniq = require('lodash.uniq');
const simpleGit = require('simple-git')();
const semver = require('semver');
const { logger } = require('boldr-utils');

const cliPkgJson = require('../../package.json');
const projectList = require('../lib/projects');
const spinner = require('../lib/spinner');
const doesYarnExist = require('../lib/doesYarnExist')();
const writeEditorConfig = require('../writers/writeEditorConfig');
const writeBoldrConfigs = require('../writers/writeBoldrConfigs');
const writeStylelint = require('../writers/writeStylelint');
const writeEslint = require('../writers/writeEslint');
const writeGitIgnore = require('../writers/writeGitIgnore');
const writeDllConfig = require('../writers/writeDllConfig');
const writeMapCoverage = require('../writers/writeMapCoverage');

const ROOT_DIR = process.cwd();
const SRC_DIR = path.resolve(ROOT_DIR, 'src');
const BOLDR_CFG_DIR = path.resolve(ROOT_DIR, '.boldr', 'boldr.config.js');

function resolveApp(relativePath) {
  return path.resolve(ROOT_DIR, relativePath);
}

function newCmd(args, options) {
  console.log(options);
  logger.start('Initializing a new Boldr project.');
  shell.config.silent = true;

  const apiRepoUrl = 'https://github.com/boldr/boldr-api.git';
  const cmsRepoUrl = 'https://github.com/strues/boldr.git';
  const projectDir = path.resolve(process.cwd(), 'boldr'); // eslint-disable-line no-useless-escape
  const cmsDir = path.resolve(process.cwd(), 'boldr/boldr-cms');
  const apiDir = path.resolve(process.cwd(), 'boldr/boldr-api');

  shell.mkdir(projectDir);

  shell.cd(projectDir);
  const nukeProj = () => shell.rm('-rf', projectDir);

  const gtfo = error => {
    logger.error('Shit broke while setting up:');
    if (error) {
      logger.log(error);
    }
    nukeProj();
    process.exit();
  };

  const handleFileWriting = error => {
    if (error) {
      logger.error('There was a problem downloading the Boldr installation.');
      logger.log(error);
      gtfo();
      spinner.failure();
    }
    logger.end('Finished cloning ✨');
    spinner.succeed();
  };
  if (options.api) {
    cloneApi();
  }
  if (options.cms) {
    cloneCms();
  }
  if (options.full) {
    cloneApi();
    cloneCms();
  }
  function cloneApi() {
    new Promise(resolve => {
      spinner.start();
      shell.mkdir(apiDir);
      simpleGit.clone(apiRepoUrl, apiDir, {}, handleFileWriting);
    });
  }
  function cloneCms() {
    new Promise(resolve => {
      spinner.start();
      shell.mkdir(cmsDir);
      simpleGit.clone(cmsRepoUrl, cmsDir, {}, handleFileWriting);
    });
  }
}

module.exports = newCmd;
