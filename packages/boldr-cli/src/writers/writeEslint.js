const path = require('path');
const shell = require('shelljs');
const { logger } = require('boldr-utils');

const ROOT_DIR = process.cwd();
const date = Date.now();

module.exports = function writeEslint() {
  const eslintFileName = '.eslintrc';
  const linkedPath = path.join(ROOT_DIR, eslintFileName);

  // Backup esLint if it exists
  if (shell.test('-f', linkedPath)) {
    const eslintBackup = path.join(ROOT_DIR, `${eslintFileName}-${date}.bak`);
    shell.mv(linkedPath, eslintBackup);
    logger.info(`Backed up current eslint file to: ${eslintBackup}`);
  }

  // Copy boldr eslintrc into the user's project.
  const esLintPath = path.join(__dirname, '../blueprints/eslintrc.tmpl');

  if (shell.cp(esLintPath, linkedPath).code === 0) {
    logger.task(`Created ${eslintFileName}`);
  } else {
    logger.error(`There was a problem creating ${eslintFileName}`);
  }
};
