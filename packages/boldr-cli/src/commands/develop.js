const path = require('path');

const program = require('caporal');
const spawn = require('cross-spawn');
const _ = require('lodash');

const pkg = require('../package.json');
const root = path.join(__dirname, '../');

function startTask() {
  spawn(
    './node_modules/.bin/webpack',
    [
      '--config',
      WEBPACK_CONFIG_PATH,
      '--display-error-details',
      '--progress',
      '--colors',
    ].concat(options.watch ? ['--watch'] : []),
    {
      env: process.env,
      cwd: options.cwd ? path.join(process.cwd(), options.cwd) : process.cwd(),
      stdio: 'inherit',
    },
  );
}
async function task(args, options) {
  const boldr = {};
  boldr.type = args.type || (await getProjectType());
  boldr.packageManager = args.packageManager || (await getPackageManager());

  const opts = { packageManager: boldr.packageManager };
  const { type } = boldr;
  getInstaller(type, opts);
  let WEBPACK_CONFIG_PATH;

  if (options.config) {
    WEBPACK_CONFIG_PATH = path.join(process.cwd(), options.config);
  } else {
    WEBPACK_CONFIG_PATH = path.join(root, 'config', 'webpack.config.es6.js');
  }
  // await config.save(process.cwd());
}

function register(program) {
  program
    .command('init', 'initialize a new Boldr project.')
    .option('-c, --config <file>', 'which config you want to use')
    .option('-w, --watch', 'watch the file change')
    .option('--cwd', 'current work dir')
    .action(handleErrors(task));
}

export default { register };
