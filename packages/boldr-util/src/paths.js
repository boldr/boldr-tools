const path = require('path');
const fs = require('fs');
const url = require('url');

const ROOT_DIR = fs.realpathSync(process.cwd());

function resolveApp(relativePath) {
  return path.resolve(ROOT_DIR, relativePath);
}
function resolveOwn(relativePath) {
  return path.resolve(__dirname, '../..', relativePath);
}
const BUILD_DIR = resolveApp('build');
const SRC_DIR = resolveApp('src');
const OUR_NODE_MODULES = resolveOwn('node_modules');
const PUBLIC_BUILD_DIR = path.join(BUILD_DIR, 'public');
const BOLDR_DIR = resolveApp('.boldr');

module.exports = {
  ROOT_DIR,
  SRC_DIR,
  OUR_NODE_MODULES,
  BOLDR_DIR,
  PUBLIC_DIR: path.join(ROOT_DIR, 'public'),
  DLL_CONFIG: path.join(BOLDR_DIR, 'dllConfig.js'),
  COMPILED_DIR: path.join(ROOT_DIR, 'compiled'),
  ASSETS_DIR: path.join(ROOT_DIR, 'public', 'assets'),
  DLL_DIR: path.join(ROOT_DIR, 'public', 'assets', 'dlls'),
  SERVER_SRC_DIR: path.join(SRC_DIR, 'server'),
  CLIENT_SRC_DIR: path.join(SRC_DIR, 'client'),
  SHARED_DIR: path.join(SRC_DIR, 'shared'),
  SERVER_BUILD_DIR: path.join(ROOT_DIR, 'compiled'),
  // This is where the client bundle outputs.
  ASSETS_BUILD_DIR: path.join(PUBLIC_BUILD_DIR, 'assets'),
  TEST_BUILD_DIR: path.join(ROOT_DIR, 'compiled', 'test'),
  USER_BOLDR_CONFIG_PATH: path.join(BOLDR_DIR, 'boldr.config.js'),
  USER_NODE_MODULES: resolveApp('node_modules'),
  USER_PKGJSON_PATH: resolveApp('package.json'),
  USER_BABEL_PATH: resolveApp('.babelrc'),
};
