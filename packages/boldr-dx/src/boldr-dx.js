#!/usr/bin/env node
import fs from 'fs';
import program from 'commander';
import updateNotifier from 'update-notifier';
import { logger as boldrUtilLogger } from 'boldr-utils/es/logger';
import pkg from '../package.json';
import devAction from './commands/dev';
// import testAction from './commands/test';
import buildAction from './commands/build';
import Engine from './engine';
import Logger from './services/logger';

// @TODO: Remove this once babel-loader updates
// https://github.com/babel/babel-loader/pull/391
process.noDeprecation = true;

updateNotifier({ pkg }).notify();

program.version(pkg.version).description('Developer utilities for Boldr.');

const executeDevCmd = (action, optionalConfig) => {
  const args = program.args.filter(item => typeof item === 'object');
  const flags = program.args.filter(item => typeof item === 'string');
  const engine: Engine = new Engine(
    fs.realpathSync(process.cwd()),
    undefined,
    new Logger(),
  );
  engine.start().catch(e => {
    console.log(e);
    process.exit(1);
  });
  process.on('SIGINT', () => {
    engine.stop();
  });
  action(engine, flags, args[0]);
};
const executeBuildCmd = (action, optionalConfig) => {
  const args = program.args.filter(item => typeof item === 'object');
  const flags = program.args.filter(item => typeof item === 'string');
  const engine: Engine = new Engine(
    fs.realpathSync(process.cwd()),
    undefined,
    new Logger(),
  );
  engine.build().catch(e => {
    console.log(e);
    process.exit(1);
  });
  process.on('SIGINT', () => {
    engine.stop();
  });
  action(engine, flags, args[0]);
};
program
  .command('build')
  .option('-C, --config <path>', 'config path')
  .description('Create a production build')
  .action(() => {
    const args = program.args.filter(item => typeof item === 'object');
    const optionalConfig = args[0].config ? args[0].config : null;
    executeBuildCmd(buildAction, optionalConfig);
  });

program
  .command('dev')
  .option('-C, --config <path>', 'config path')
  .description('Start an express server for development')
  .action(() => {
    const args = program.args.filter(item => typeof item === 'object');
    const optionalConfig = args[0].config ? args[0].config : null;
    executeDevCmd(devAction, optionalConfig);
  });

// program
//   .command('test')
//   .description('Run test files against a browser env with Jest.')
//   .action(() => executeCmd(testAction));

program.parse(process.argv);
