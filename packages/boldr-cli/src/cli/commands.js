const program = require('commander');
const initAction = require('./actions/init');
const listAction = require('./actions/list');

const loadArgsAndDo = (action) => {
  const args = program.args.filter(item => typeof item === 'object');
  const flags = program.args.filter(item => typeof item === 'string');
  action(flags, args[0]);
};

program
  .command('init')
  .description('Generate a project from a github url to get started.')
  .option('-d, --directory <path>', 'Optional: Creates the given directory name and installs there. Defaults to your current working directory.')
  .option('-r, --repository [address]', 'Optional: Github repository address')
  .option('-b, --boldr-version [version]', 'Optional: Version of boldr-dx to install')
  .option('-p, --package-manager <npm|yarn>', 'Optional: Specify which package manager to use (npm or yarn). Defaults to yarn if it is installed globally.')
  .option('--local-path [path]', 'Optional: Local path for a boldr-pack. For copying local boldr-packs for testing.')
  .action(() => loadArgsAndDo(initAction));

program
  .command('list')
  .description('Lists availble supported boldr-packs')
  .action(listAction);


program.parse(process.argv);
