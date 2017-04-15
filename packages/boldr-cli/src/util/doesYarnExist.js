const shell = require('shelljs');

const doesYarnExist = () => shell.exec('yarn --version').code === 0;

module.exports = () => (doesYarnExist() ? 'yarn' : 'npm');
