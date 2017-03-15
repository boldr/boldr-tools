const path = require('path');
const fs = require('fs-extra');
const shell = require('shelljs');
const { logger } = require('boldr-utils');

const ROOT_DIR = process.cwd();
const BOLDR_CFG_DIR = path.resolve(ROOT_DIR, '.boldr', 'boldr.config.js');
const date = Date.now();

module.exports = function writeBoldrConfigs(tmpDir) {
  const dir = `${ROOT_DIR}/.boldr`;
  fs.ensureDir(dir, err => {
    console.log(err);
  });
  const configFileName = 'boldr.config.js';
  const tmpConfig = path.join(tmpDir, configFileName);
  const baseConfig = path.join(__dirname, `../blueprints/${configFileName}`);
  let newConfig = tmpConfig;

  // Use the base boldr.config
  if (!shell.test('-f', tmpConfig)) {
    newConfig = baseConfig;
  }

  const copyBoldrConfig = () => {
    shell.cp(newConfig, BOLDR_CFG_DIR);
    logger.task(`Created ${configFileName} file`);
  };
  // Check if a boldr.config file already exists. If it does
  // create a copy and then replace.
  if (shell.test('-f', BOLDR_CFG_DIR)) {
    const mvTo = path.join(ROOT_DIR, `${configFileName}-${date}.bak`);
    shell.mv('-f', BOLDR_CFG_DIR, mvTo);
    logger.info(`Backed up current ${configFileName} to: ${mvTo}`);
    copyBoldrConfig();
  } else {
    copyBoldrConfig();
  }
};
