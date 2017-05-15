/* @flow */

import defaultConfig from './defaultConfig';

module.exports = function loadConfig(engine: Engine): Config {
  try {
    const configModulePath = engine.configFilePath();

    // first clean up require cache so we always load fresh config
    delete require.cache[configModulePath];
    // then require the fresh config
    const config = require(configModulePath); // eslint-disable-line global-require

    return {
      env: {
        ...defaultConfig.env,
        ...(config.env || {}),
      },
      plugins: [...defaultConfig.plugins, ...(config.plugins || [])],
      settings: {
        ...defaultConfig.settings,
        ...config.settings,
      },
    };
  } catch (e) {
    return defaultConfig;
  }
};
