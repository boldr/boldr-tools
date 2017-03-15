const path = require('path');
const shell = require('shelljs');
const { logger } = require('boldr-utils');

const ROOT_DIR = process.cwd();
const date = Date.now();

module.exports = function writeStylelint() {
  const stylelintrc = '.stylelintrc';
  const userStylelintPath = path.join(ROOT_DIR, stylelintrc);

    // Backup the user's .stylelintrc if it exists.
  if (shell.test('-f', userStylelintPath)) {
    const stylelintBackup = path.join(ROOT_DIR, `${stylelintrc}-${date}.bak`);
    shell.mv(userStylelintPath, stylelintBackup);
    logger.info(`Backed up current stylelint file to: ${stylelintBackup}`);
  }

    // Copy boldr .stylelintrc into the user's project
  const stylelintPath = path.join(__dirname, '../blueprints/stylelintrc.tmpl');
  if (shell.cp(stylelintPath, userStylelintPath).code === 0) {
    logger.task(`Created ${stylelintrc}`);
  } else {
    logger.error(`There was a problem creating ${stylelintrc}`);
  }
};
