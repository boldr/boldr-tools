const ora = require('ora');

const spinner = ora({
  spinner: 'dots2',
  color: 'cyan',
});

module.exports = spinner;
