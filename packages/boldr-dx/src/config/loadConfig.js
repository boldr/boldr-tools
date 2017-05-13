/* @flow */
import fs from 'fs';
import path from 'path';

function getEnvParam(param: string): string {
  if (process.env[param]) {
    return process.env[param];
  }

  throw new Error(`process.env.${param} is not set`);
}

const cwd = fs.realpathSync(process.cwd());

const defaultConfig = {
  env: {
    NODE_ENV: getEnvParam('NODE_ENV'),
  },
  plugins: [
    require('../plugins/watchConfig'),
  ],
  settings: {
    projectNodeModules: path.resolve(cwd, './node_modules'),
    assetsPath: path.resolve(cwd, './build/assets.json'),
    projectSrcDir: path.resolve(cwd, './src'),
    babelrc: null,
    eslintrc: path.resolve(cwd, './.eslintrc'),
    cssModules: true,
    wpProfile: true,
  },
};

module.exports = function loadConfig(engine: Engine): Config {
  try {
    const configModulePath = engine.configFilePath();

    // first clean up require cache so we always load fresh config
    delete require.cache[configModulePath];
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

module.exports.defaultConfig = defaultConfig;
