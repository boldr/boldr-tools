
const BoldrConfig = require('./lib/boldrConfig');


exports = module.exports = function(applicationName, defaults, opts) {
  return new BoldrConfig(applicationName, defaults, opts);
};


exports.BoldrConfig = BoldrConfig;
