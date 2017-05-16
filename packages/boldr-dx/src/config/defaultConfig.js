/* @flow */

import fs from 'fs';
import path from 'path';

/**
 * Path of the current working directory, with symlinks taken
 * into account.
 * @type {String}
 */
export const cwd = fs.realpathSync(process.cwd());

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

/**
 * ensures an environment variable exists by throwing an error if it
 * is not set.
 * @param  {string} param a process.env. value
 * @return {string}       the process.env value
 */
function getEnvParam(param: string): string {
  if (process.env[param]) {
    return process.env[param];
  }

  throw new Error(`process.env.${param} is not set`);
}

const defaultConfig = {
  inline: {
    NODE_ENV: getEnvParam('NODE_ENV'),
  },
  plugins: [require('../plugins/watchConfig')],
  settings: {
    nodePaths,
    cssModules: true,
    wpProfile: true,
    webPath: '/assets/',
    // __dirname, ./../../node_modules
    boldrNodeModules: resolveBoldr('node_modules'),
    // <USER_PROJECT_ROOT>/node_modules
    projectNodeModules: resolveProject('node_modules'),
    // <USER_PROJECT_ROOT>/package.json
    userPkgPath: resolveProject('package.json'),
    boldrDir: resolveProject('.boldr'),
    boldrConfigPath: resolveProject('.boldr/boldr.js'),
    srcDir: resolveProject('src'),
    publicDir: resolveProject('public'),
    assetsDir: resolveProject('public/assets'),
    bundleAssetsFileName: 'assets.json',
    chunkManifestFileName: 'manifest.json',

    babelrc: null,
    eslintrc: resolveProject('.eslintrc'),
  },
};

export default defaultConfig;
