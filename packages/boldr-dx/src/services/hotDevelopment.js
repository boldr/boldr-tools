/* eslint-disable eqeqeq */
import path from 'path';
import webpack from 'webpack';
import logger from 'boldr-utils/es/logger';
import _debug from 'debug';
import buildDevDlls from '../webpack/plugins/buildDevDlls';
import configBuilder from '../webpack/configBuilder';
import appRoot from '../utils/appRoot';
import HotNodeServer from './hotNodeServer';
import HotClientServer from './hotClientServer';

const debug = _debug('boldr:dx:services:hotDev');

function safeDisposer(server) {
  debug('Disposing');
  return server ? server.dispose() : Promise.resolve();
}

const initializeBundle = (config, name) => {
  const createCompiler = () => {
    try {
      const webpackConfig = configBuilder({
        config,
        target: name,
        mode: 'development',
      });
      // Install the vendor DLL config for the client bundle if required.
      if (name === 'web') {
        // Install the vendor DLL plugin.
        webpackConfig.plugins.push(
          new webpack.DllReferencePlugin({
            // $FlowFixMe
            manifest: require(path.resolve(
              config.bundle.assetsDir,
              '__vendor_dlls__.json',
            )),
          }),
        );
      }
      return webpack(webpackConfig);
    } catch (err) {
      logger.error(
        'Webpack config is invalid, please check the console for more information.',
      );
      console.error(err);
      throw err;
    }
  };

  return { name, createCompiler };
};

class HotDevelopment {
  constructor(config) {
    this.hotClientServer = null;
    this.hotNodeServer = null;
    this.config = config;

    const clientBundle = initializeBundle(config, 'web');
    const nodeBundle = initializeBundle(config, 'async-node');

    Promise.resolve(buildDevDlls(config))
      .then(
        () =>
          new Promise(resolve => {
            const { createCompiler } = clientBundle;
            const compiler = createCompiler();
            compiler.plugin('done', stats => {
              if (!stats.hasErrors()) {
                resolve(compiler);
              }
            });
            this.hotClientServer = new HotClientServer(compiler, config);
          }),
      )
      // Then start the node development server(s).
      .then(clientCompiler => {
        this.hotNodeServer = new HotNodeServer(
          'async-node',
          nodeBundle.createCompiler(),
          clientCompiler,
        );
      });
  }
  dispose() {
    // First the hot client server. Then dispose the hot node server.
    return safeDisposer(this.hotClientServer)
      .then(() => safeDisposer(this.hotNodeServer))
      .catch(error => {
        console.error(error);
      });
  }
}

export default HotDevelopment;
