const path = require('path');
const fs = require('fs-extra');
const shell = require('shelljs');
const { logger } = require('boldr-utils');

const ROOT_DIR = process.cwd();
const date = Date.now();

module.exports = function writeDllConfig(tmpDir) {
  const dir = `${ROOT_DIR}/.boldr`;
  fs.ensureDir(dir, err => {
    console.log(err);
  });
  const configFileName = 'dll.config.js';
  const tmpConfig = path.join(tmpDir, configFileName);
  const baseConfig = path.join(__dirname, `../blueprints/${configFileName}`);
  let newConfig = tmpConfig;

    // Use the base boldr.config
  if (!shell.test('-f', tmpConfig)) {
    newConfig = baseConfig;
  }

  const copyDllConfig = () => {
    shell.cp(newConfig, dir);
    logger.task(`Created ${configFileName}`);
  };
    // Check if a boldr.config file already exists. If it does
    // create a copy and then replace.
  if (shell.test('-f', dir)) {
    const mvTo = path.join(ROOT_DIR, `${configFileName}-${date}.bak`);
    shell.mv('-f', dir, mvTo);
    logger.info(`Copied existing ${configFileName} to: ${mvTo}`);
    copyDllConfig();
  } else {
    copyDllConfig();
  }
};
