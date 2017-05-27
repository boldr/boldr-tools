/* @flow */
import path from 'path';
import _debug from 'debug';
import appRoot from 'boldr-utils/es/node/appRoot';
import defaultConfig from './defaultConfig';

const debug = _debug('boldr:dx:config:loadConfig');

export default function loadConfig(engine): Config {
  try {
    const configModulePath = engine.configFilePath();
    const inputOpts = engine.getInputOptions();
    debug('Clearing require cache');
    // first clean up require cache so we always load fresh config
    delete require.cache[configModulePath];
    // then require the fresh config
    const config = require(configModulePath); // eslint-disable-line global-require

    debug('Loaded fresh config values');

    return {
      env: {
        ...defaultConfig.env,
        ...(config.env || {}),
      },
      plugins: [...defaultConfig.plugins, ...(config.plugins || [])],
      bundle: {
        ...defaultConfig.bundle,
        ...config.bundle,
      },
    };
  } catch (e) {
    return defaultConfig;
  }
}
