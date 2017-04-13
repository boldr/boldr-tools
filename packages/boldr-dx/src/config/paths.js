const path = require('path');
const fs = require('fs');
const url = require('url');
const appRootDir = require('app-root-dir');

const rootDir = appRootDir.get();

function resolveApp(...args) {
  return path.resolve(rootDir, ...args);
}

function resolveOwn(...args) {
  return path.resolve(__dirname, '../..', ...args);
}

const nodePaths = (process.env.NODE_PATH || '')
  .split(process.platform === 'win32' ? ';' : ':')
  .filter(Boolean)
  .filter(folder => !path.isAbsolute(folder))
  .map(resolveApp);

const srcDir = resolveApp('src');
const ourNodeModules = resolveOwn('node_modules');
const boldrDir = resolveApp('.boldr');

module.exports = {
  rootDir,
  srcDir,
  ourNodeModules,
  boldrDir,
  nodePaths,
  publicDir: path.join(rootDir, 'public'),
  dllConfig: path.join(boldrDir, 'dll.config.js'),
  compiledDir: path.join(rootDir, 'compiled'),
  assetsDir: path.join(rootDir, 'public', 'assets'),
  dllDir: path.join(rootDir, 'public', 'assets', 'dlls'),
  serverSrcDir: path.join(srcDir, 'server'),
  clientSrcDir: path.join(srcDir, 'client'),
  sharedDir: path.join(srcDir, 'shared'),
  userBoldrConfigPath: path.join(boldrDir, 'boldr.config.js'),
  userNodeModules: resolveApp('node_modules'),
  userPkgPath: resolveApp('package.json'),
  userbabelRc: resolveApp('.babelrc'),
};
