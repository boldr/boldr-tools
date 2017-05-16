#!/usr/bin/env node
/* @flow */
/* eslint-disable flowtype/no-types-missing-file-annotation */
import fs from 'fs';
import program from 'commander';
import updateNotifier from 'update-notifier';
import logger from 'boldr-utils/es/logger';
import pkg from '../package.json';

// import testAction from './commands/test';
import Engine from './engine';

import { cwd } from './config/paths';

// @TODO: Remove this once babel-loader updates
// https://github.com/babel/babel-loader/pull/391
// $FlowIssue
process.noDeprecation = true;

updateNotifier({ pkg }).notify();

const executeCmd = (action, optionalConfig) => {
  const args = program.args.filter(item => typeof item === 'object');
  const flags = program.args.filter(item => typeof item === 'string');
  // const config = boldrConfigFactory(optionalConfig);
  action(flags, args[0]);
};
program.version(pkg.version).description('Developer utilities for Boldr.');

program
  .command('build')
  .option('-C, --config <path>', 'config path')
  .description('Create a production build')
  .action(() => {
    const engine: Engine = new Engine(
      fs.realpathSync(process.cwd()),
      undefined,
    );
    engine.build().then(
      () => {
        console.log('Successfully built');
        process.exit(0);
      },
      err => {
        console.log('Build failed');
        console.log(err);
        process.exit(1);
      },
    );
  });

program
  .command('dev')
  .option('-p, --port', 'use a custom port')
  .description('Start the development process.')
  .action(() => {
    const args = program.args.filter(item => typeof item === 'object');
    const optionalConfig = args[0].config ? args[0].config : null;
    const engine: Engine = new Engine(
      fs.realpathSync(process.cwd()),
      undefined,
    );
    engine.start().catch(e => {
      console.log(e);
      process.exit(1);
    });
    process.on('SIGINT', () => {
      engine.stop();
    });
  });

// program
//   .command('test')
//   .description('Run test files against a browser env with Jest.')
//   .action(() => executeCmd(testAction));

program.parse(process.argv);
