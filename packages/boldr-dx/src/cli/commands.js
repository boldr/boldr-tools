import program from 'commander';
import shell from 'shelljs';
import { logger } from 'boldr-utils';

const boldrConfigFactory = require('../utils/boldrConfig');

const paths = require('../config/paths');
const devAction = require('./actions/dev');
const lintScriptAction = require('./actions/lintScript');
const testAction = require('./actions/test');
const testNodeAction = require('./actions/testNode');
const buildAction = require('./actions/build');
const lintStyleAction = require('./actions/lintStyle');

// @TODO: Remove this once babel-loader updates
// https://github.com/babel/babel-loader/pull/391
process.noDeprecation = true;

shell.config.silent = true;
// Kill the process if the user did not run the command from the root of their project.
if (!shell.test('-f', paths.USER_PKGJSON_PATH)) {
  logger.error('Sorry, but boldr-dx must be run from the root of your project.');
  process.exit(1);
}

process.on('SIGINT', () => {
  logger.warn('boldr-dx interrupted  🙅');
  process.exit(0);
});

const executeCmd = (action, optionalConfig) => {
  const args = program.args.filter(item => typeof item === 'object');
  const flags = program.args.filter(item => typeof item === 'string');
  const config = boldrConfigFactory(optionalConfig);

  action(config, flags, args[0]);
};

program
  .command('build')
  .option('-C, --config <path>', 'config path')
  .description('Create a production build')
  .action(() => {
    const args = program.args.filter(item => typeof item === 'object');
    const config = args[0].config ? args[0].config : null;
    executeCmd(buildAction, config);
  });

program
  .command('dev')
  .option('-C, --config <path>', 'config path')
  .description('Start an express server for development')
  .action(() => {
    const args = program.args.filter(item => typeof item === 'object');
    const config = args[0].config ? args[0].config : null;
    executeCmd(devAction, config);
  });

program
  .command('lint:js')
  .description('lints .js files in the ./src directory.')
  .action(() => executeCmd(lintScriptAction));

program
  .command('lint:styles')
  .description('')
  .action(() => executeCmd(lintStyleAction));

program
  .command('test')
  .description('Run test files against a browser en with Jest.')
  .action(() => executeCmd(testAction));

program
  .command('test:node')
  .description('Run test files against a Node env with Jest.')
  .action(() => executeCmd(testNodeAction));


program.parse(process.argv);
