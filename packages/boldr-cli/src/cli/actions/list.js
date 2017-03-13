const logger = require('../../utils/logger');
const boldrProjects = require('../../config/boldrProjects');

const log = console.log; // eslint-disable-line

const printproject = (li, project) => {
  log(`${li}. The ${project.displayName} Boldr project:`);
  log(`${project.description}`);
  log('✅  To install this Boldr project: ');
  log(`${project.install}`);
  log('\n');
};

module.exports = () => {
  logger.start('Listing Boldr projects');
  Object.keys(boldrProjects).forEach((projectKind, index) => {
    const li = index + 1;
    printproject(li, boldrProjects[projectKind]);
  });
  logger.end('List complete');
};
