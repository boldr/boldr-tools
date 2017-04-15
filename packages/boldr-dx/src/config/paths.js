const path = require('path');
const fs = require('fs');
const url = require('url');
const appRootDir = require('app-root-dir');

const rootDir = appRootDir.get();

function resolveApp(...args) {
  return path.resolve(rootDir, ...args);
}

function resolveBoldr(...args) {
  return path.resolve(__dirname, '../..', ...args);
}

const safeReaddirSync = dirPath => {
  try {
    return fs.readdirSync(dirPath);
  } catch (e) {
    return [];
  }
};

const nodePaths = (process.env.NODE_PATH || '')
  .split(process.platform === 'win32' ? ';' : ':')
  .filter(Boolean)
  .filter(folder => !path.isAbsolute(folder))
  .map(resolveApp);

const srcDir = resolveApp('src');
const ourNodeModules = resolveBoldr('node_modules');
const boldrDir = resolveApp('.boldr');

const externalModules = modulesPath => safeReaddirSync(modulesPath).filter(m => m !== '.bin');
const appNodeModules = externalModules(resolveApp('node_modules')).filter(m => m !== 'boldr-dx');
const boldrNodeModules = externalModules(resolveBoldr('node_modules'));

module.exports = {
  rootDir,
  srcDir,
  ourNodeModules,
  boldrDir,
  nodePaths,
  appNodeModules,
  boldrNodeModules,
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
