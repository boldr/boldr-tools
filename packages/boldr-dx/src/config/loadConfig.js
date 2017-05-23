/* @flow */
import path from 'path';
import BoldrConfig from 'boldr-config';
import _debug from 'debug';
import appRoot from 'boldr-utils/es/node/appRoot';
import defaultConfig from './defaultConfig';

const debug = _debug('boldr:dx:config:loadConfig');

export default function loadConfig(): Config {
  try {
    const configModulePath = path.resolve(appRoot.get(), './.boldr/boldr.js');
    debug('Clearing require cache');
    // first clean up require cache so we always load fresh config
    delete require.cache[configModulePath];
    // then require the fresh config
    const config = require(configModulePath); // eslint-disable-line global-require
    const boldrconfig = new BoldrConfig('boldr', config);

    debug('Loaded fresh config values');

    return {
      env: {
        ...defaultConfig.env,
        ...(boldrconfig.env || {}),
      },
      bundle: {
        ...defaultConfig.bundle,
        ...boldrconfig.bundle,
      },
      server: {
        ...defaultConfig.bundle,
        ...boldrconfig.bundle,
      },
      logging: {
        ...defaultConfig.bundle,
        ...boldrconfig.bundle,
      },
      db: {
        ...defaultConfig.bundle,
        ...boldrconfig.bundle,
      },
      redis: {
        ...defaultConfig.bundle,
        ...boldrconfig.bundle,
      },
      token: {
        ...defaultConfig.bundle,
        ...boldrconfig.bundle,
      },
      mail: {
        ...defaultConfig.bundle,
        ...boldrconfig.bundle,
      },
      cors: {
        ...defaultConfig.bundle,
        ...boldrconfig.bundle,
      },
    };
  } catch (e) {
    return defaultConfig;
  }
}
