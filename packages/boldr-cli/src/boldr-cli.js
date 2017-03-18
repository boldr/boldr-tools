#!/usr/bin/env node
require('./lib/checkNodeVersion');

const program = require('caporal');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
const initCmd = require('./commands/init');
// const componentCmd = require('./commands/component');

program.STRING = value => (typeof value === 'string' ? value : null);

updateNotifier({ pkg }).notify();

program.version(pkg.version);

program
  .command('init', 'Initialize a new project.')
  .alias('i')
  .option('-d, --directory <path>', 'Define a directory for a new Boldr project. Defaults to current working directory.') // eslint-disable-line
  .option('-r, --repository [location]', 'Github repository address')
  .option('-p, --package-manager [npm|yarn]', 'Specify a package manager to use (yarn or npm). Defaults to yarn.')
  .option('--local-path [path]', 'Local path to install a project from.')
  .action(initCmd);


program.parse(process.argv);
