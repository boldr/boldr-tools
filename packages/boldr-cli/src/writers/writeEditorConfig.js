const path = require('path');
const shell = require('shelljs');
const { logger } = require('boldr-utils');

const ROOT_DIR = process.cwd();
const date = Date.now();

module.exports = function writeEditorConfig() {
  const editorConfigTpl = path.join(__dirname, '../blueprints/editorconfig.tmpl');
  const editorConfigPath = path.join(ROOT_DIR, '.editorconfig');

  // Backup existing editor config
  if (shell.test('-f', editorConfigPath)) {
    const mvTo = path.join(ROOT_DIR, `editorconfig-${date}.bak`);
    shell.mv(editorConfigPath, mvTo);
    logger.info(`Backed up current editor config to ${mvTo}`);
  }

  shell.cp(editorConfigTpl, editorConfigPath);
  logger.task('Created .editorconfig');
};
