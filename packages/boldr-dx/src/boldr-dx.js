#!/usr/bin/env node
/* @flow */
/* eslint-disable flowtype/no-types-missing-file-annotation */
import fs from 'fs';
import program from 'caporal';
import Promise from 'bluebird';
import logger from 'boldr-utils/es/logger';
import _debug from 'debug';
import pkg from '../package.json';
import dev from './commands/dev';
import clean from './commands/clean';
import build from './commands/build';

global.Promise = Promise;
Promise.config({
  // Enable warnings
  warnings: false,
  // Enable long stack traces
  longStackTraces: true,
});

const debug = _debug('boldr:dx:dx');
// @TODO: Remove this once babel-loader updates
// https://github.com/babel/babel-loader/pull/391
// $FlowIssue
process.noDeprecation = true;

process.on('unhandledRejection', err => {
  logger.error(`Exiting due to ${err}`);
  throw err;
});
// Hacky/fix for Caporal
program.STRING = value => (typeof value === 'string' ? value : null);

program.version(pkg.version).description('Boldr developer tools.');

build.register(program);
clean.register(program);
dev.register(program);

program.parse(process.argv);
