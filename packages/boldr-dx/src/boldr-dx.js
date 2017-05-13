#!/usr/bin/env node
import fs from 'fs';
import program from 'commander';
import updateNotifier from 'update-notifier';
import { logger as boldrUtilLogger } from 'boldr-utils/es/logger';

import pkg from '../package.json';

// import { log, logError, logSuccess, logWarning } from './utils/log';
// import boldrConfigFactory from './config/boldrConfig';
// import paths from './config/paths';

import devAction from './commands/dev';
// import lintScriptAction from './commands/lintScripts';
// import testAction from './commands/test';
import buildAction from './commands/build';
// import lintStyleAction from './commands/lintStyles';
import Engine from './engine';
import Logger from './services/logger';

// @TODO: Remove this once babel-loader updates
// https://github.com/babel/babel-loader/pull/391
process.noDeprecation = true;

const configurations = {
  client: {
    development: require('./webpack/browser/webpack.dev.config'),
    production: require('./webpack/browser/webpack.prod.config'),
  },
  server: {
    development: require('./webpack/node/webpack.dev.config'),
    production: require('./webpack/node/webpack.prod.config'),
  },
};

updateNotifier({ pkg }).notify();

program.version(pkg.version).description('Developer utilities for Boldr.');

// Kill the process if the user did not run the command from the root of
// their project.
// if (!shell.test('-f', paths.userPkgPath)) {
//   boldrUtilLogger.error(
//     'Sorry! Boldr DX must be run from the root of your project.',
//   );
//   process.exit(1);
// }


//
// const executeCmd = (action, optionalConfig) => {
//   const args = program.args.filter(item => typeof item === 'object');
//   const flags = program.args.filter(item => typeof item === 'string');
//   const config = boldrConfigFactory(optionalConfig);
//
//   action(config, flags, args[0]);
// };

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
//
// program
//   .command('lint:js')
//   .description('lints .js files in the ./src directory.')
//   .action(() => executeCmd(lintScriptAction));
//
// program
//   .command('lint:styles')
//   .description('')
//   .action(() => executeCmd(lintStyleAction));
//
// program
//   .command('test')
//   .description('Run test files against a browser env with Jest.')
//   .action(() => executeCmd(testAction));

program.parse(process.argv);
