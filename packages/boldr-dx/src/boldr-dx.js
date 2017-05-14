#!/usr/bin/env node
import fs from 'fs';
import program from 'commander';
import updateNotifier from 'update-notifier';
import { logger as boldrUtilLogger } from 'boldr-utils/es/logger';
import pkg from '../package.json';

import testAction from './commands/test';
import Engine from './engine';
import Logger from './services/logger';
import { cwd } from './config/defaultConfig';

// @TODO: Remove this once babel-loader updates
// https://github.com/babel/babel-loader/pull/391
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
    const engine: Engine = new Engine(cwd, undefined, new Logger());
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
  .option('-C, --config <path>', 'config path')
  .description('Start an express server for development')
  .action(() => {
    const args = program.args.filter(item => typeof item === 'object');
    const optionalConfig = args[0].config ? args[0].config : null;
    const engine: Engine = new Engine(cwd, undefined, new Logger());
    engine.start().catch(e => {
      console.log(e);
      process.exit(1);
    });
    process.on('SIGINT', () => {
      engine.stop();
    });
  });

program
  .command('test')
  .description('Run test files against a browser env with Jest.')
  .action(() => executeCmd(testAction));

program.parse(process.argv);
