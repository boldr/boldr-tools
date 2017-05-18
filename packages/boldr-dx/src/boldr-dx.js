#!/usr/bin/env node
/* @flow */
/* eslint-disable flowtype/no-types-missing-file-annotation */
import fs from 'fs';
import program from 'caporal';
import updateNotifier from 'update-notifier';
import logger from 'boldr-utils/es/logger';
import pkg from '../package.json';
import dev from './commands/dev';
import clean from './commands/clean';
import build from './commands/build';

// import testAction from './commands/test';
import Engine from './engine';
import { cwd } from './config/paths';

// @TODO: Remove this once babel-loader updates
// https://github.com/babel/babel-loader/pull/391
// $FlowIssue
process.noDeprecation = true;
// Hacky/fix for Caporal
program.STRING = value => (typeof value === 'string' ? value : null);

updateNotifier({ pkg }).notify();

program.version(pkg.version).description('Boldr developer tools.');

build.register(program);
clean.register(program);
dev.register(program);

program.parse(process.argv);
