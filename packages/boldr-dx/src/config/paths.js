const fs = require('fs');
const path = require('path');
const appRoot = require('boldr-utils/es/node/appRoot');
/**
 * Path of the current working directory, with symlinks taken
 * into account.
 * @type {String}
 */
export const cwd = appRoot.get();

/**
 * Get the path from the user's project root
 * @param  {String} args the path we are trying to reach
 * @return {any}      whatever it is we're looking for
 */
function resolveProject(...args) {
  return path.resolve(cwd, ...args);
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

module.exports = {
  nodePaths: nodePaths,
  boldrNodeModules: resolveBoldr('node_modules'),
  projectNodeModules: resolveProject('node_modules'),
  projectPkg: resolveProject('package.json'),
  cacheDir: resolveProject('node_modules/.boldr_cache'),
};
