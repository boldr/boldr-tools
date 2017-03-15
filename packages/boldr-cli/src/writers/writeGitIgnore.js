const path = require('path');
const shell = require('shelljs');
const { logger } = require('boldr-utils');

const ROOT_DIR = process.cwd();
const date = Date.now();

module.exports = function writeGitIgnore() {
  const gitignoreFile = path.join(ROOT_DIR, './.gitignore');
  if (!shell.test('-f', gitignoreFile)) {
    const gitignoreLocal = path.resolve(__dirname, '../blueprints/gitignore.tmpl');
    shell.cp(gitignoreLocal, gitignoreFile);
    logger.task('Created .gitignore');
  }
};
