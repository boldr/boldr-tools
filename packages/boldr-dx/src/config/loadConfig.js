/* @flow */
import BoldrConfig from 'boldr-config';
import _debug from 'debug';

const debug = _debug('boldr:dx:loadConfig');

module.exports = function loadConfig(engine: Engine): Config {
  const configModulePath = engine.configFilePath();
  debug('Clearing require cache', configModulePath);
  // first clean up require cache so we always load fresh config
  delete require.cache[configModulePath];
  // then require the fresh config
  const config = require(configModulePath); // eslint-disable-line global-require
  const boldrconfig = new BoldrConfig('boldr', config);

  debug('Loaded fresh config values');
  //@NOTE You can skip plugins entirely. we could make htis an option
  // console.log(JSON.stringify(config, null, 4));
  return boldrconfig;
};
