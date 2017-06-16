/* eslint-disable object-shorthand */
const fs = require("fs");
const path = require("path");
const appRoot = require("boldr-utils/lib/node/appRoot");

/**
 * Path of the current working directory, with symlinks taken
 * into account.
 * @type {String}
 */
const cwd = fs.realpathSync(process.cwd());

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
  return path.resolve(__dirname, "../..", ...args);
}

/**
 * Enables resolving paths via NODE_PATH. Shout out to create-react-app
 * https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/config/paths.js#L24
 * @type {String}
 */
const nodePaths = (process.env.NODE_PATH || "")
  .split(process.platform === "win32" ? ";" : ":")
  .filter(Boolean)
  .filter(folder => !path.isAbsolute(folder))
  .map(resolveProject);

const ownPackageJson = require("../../package.json");
const boldrDxPath = resolveProject(`node_modules/${ownPackageJson.name}`);
const boldrDxLinked =
  fs.existsSync(boldrDxPath) && fs.lstatSync(boldrDxPath).isSymbolicLink();

// config before publish: we're in ./packages/react-scripts/config/
if (
  !boldrDxLinked &&
  __dirname.indexOf(path.join("packages", "boldr-dx", "config")) !== -1
) {
  console.log("hello");
}

module.exports = {
  nodePaths: nodePaths,
  dotEnvPath: resolveProject(".env"),
  boldrNodeModules: resolveBoldr("node_modules"),
  projectNodeModules: resolveProject("node_modules"),
  adminDir: resolveProject("src/shared/scenes/Admin"),
  blogDir: resolveProject("src/shared/scenes/Blog"),
  componentsDir: resolveProject("src/shared/components"),
  scenesDir: resolveProject("src/shared/scenes"),
  stateDir: resolveProject("src/shared/state"),
  coreDir: resolveProject("src/shared/core"),
  srcDir: resolveProject("src"),
  tmplDir: resolveProject("src/shared/templates"),
  projectPkg: resolveProject("package.json"),
  cacheDir: resolveProject("node_modules/.boldr_cache"),
};
