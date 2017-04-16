import path from 'path';
import fs from 'fs-extra';

/**
 * Path of the current working directory, with symlinks taken
 * into account.
 * @type {String}
 */
const rootDir = fs.realpathSync(process.cwd());

/**
 * Get the path from the user's project root
 * @param  {String} args the path we are trying to reach
 * @return {any}      whatever it is we're looking for
 */
function resolveProject(...args) {
  return path.resolve(rootDir, ...args);
}

/**
 * Get the path from the root of the boldr-dx directory
 * @param  {String} args the path we are trying to reach
 * @return {any}      whatever it is we're looking for
 */
function resolveBoldr(...args) {
  return path.resolve(__dirname, '../..', ...args);
}

/**
 * Enables resolving paths via NODE_PATH. Shout out to create-react-app
 * https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/config/paths.js#L24
 * @type {String}
 */
const nodePaths = (process.env.NODE_PATH || '')
  .split(process.platform === 'win32' ? ';' : ':')
  .filter(Boolean)
  .filter(folder => !path.isAbsolute(folder))
  .map(resolveProject);

// Currently we are here:
// <USER_PROJECT_ROOT>/node_modules/boldr-dx/dist/config
module.exports = {
  rootDir,
  nodePaths,
  // __dirname, ./../..
  ownPath: resolveBoldr('.'),
  // __dirname, ./../../node_modules
  boldrNodeModules: resolveBoldr('node_modules'),
  // <USER_PROJECT_ROOT>/node_modules
  userNodeModules: resolveProject('node_modules'),
  // <USER_PROJECT_ROOT>/.happypack
  happyPackDir: resolveProject('.happypack'),
  // <USER_PROJECT_ROOT>/package.json
  userPkgPath: resolveProject('package.json'),
  userbabelRc: resolveProject('.babelrc'),
  userEslintRc: resolveProject('.eslintrc'),
  userStylelintRc: resolveProject('.stylelintrc'),
  boldrDir: resolveProject('.boldr'),
  boldrConfigPath: resolveProject('.boldr/boldr.config.js'),

  srcDir: resolveProject('src'),
  serverSrcDir: resolveProject('src/server'),
  clientSrcDir: resolveProject('src/client'),
  sharedDir: resolveProject('src/shared'),

  publicDir: resolveProject('public'),
  dllConfig: resolveProject('.boldr/dll.config.js'),
  compiledDir: resolveProject('compiled'),
  assetsDir: resolveProject('public/assets'),
  dllDir: resolveProject('public/assets/dlls'),
};
