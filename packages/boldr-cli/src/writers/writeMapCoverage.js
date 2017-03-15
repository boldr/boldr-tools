const path = require('path');
const fs = require('fs-extra');
const shell = require('shelljs');
const { logger } = require('boldr-utils');

const ROOT_DIR = process.cwd();
const date = Date.now();

module.exports = function writeMapCoverage(tmpDir) {
  const dir = `${ROOT_DIR}/.boldr`;
  fs.ensureDir(dir, err => {
    console.log(err);
  });
  const configFileName = 'mapCoverage.js';
  const tmpConfig = path.join(tmpDir, configFileName);
  const baseConfig = path.join(__dirname, `../blueprints/${configFileName}`);
  let newConfig = tmpConfig;

  // Use the base boldr.config
  if (!shell.test('-f', tmpConfig)) {
    newConfig = baseConfig;
  }

  const copyMapCoverage = () => {
    shell.cp(newConfig, dir);
    logger.task(`Created ${configFileName} file`);
  };
  // Check if a boldr.config file already exists. If it does
  // create a copy and then replace.
  if (shell.test('-f', dir)) {
    const mvTo = path.join(ROOT_DIR, `${configFileName}-${date}.bak`);
    shell.mv('-f', dir, mvTo);
    logger.info(`Backed up existing ${configFileName} to: ${mvTo}`);
    copyMapCoverage();
  } else {
    copyMapCoverage();
  }
};
