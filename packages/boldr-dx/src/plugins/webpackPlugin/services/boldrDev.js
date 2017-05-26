/* eslint-disable eqeqeq */
import path from 'path';
import webpack from 'webpack';
import logger from 'boldr-utils/es/logger';
import _debug from 'debug';
import buildDevDlls from '../plugins/buildDevDlls';
import createBrowserWebpack from '../createBrowserWebpack';
import createNodeWebpack from '../createNodeWebpack';
import createCompiler from './createCompiler';
import HotNodeServer from './hotNodeServer';
import HotClientServer from './hotClientServer';

const debug = _debug('boldr:dx:services:boldrDev');

function handleShutdown(server) {
  return server ? server.shutdown() : Promise.resolve();
}

class BoldrDev {
  constructor(config) {
    this.hotClientServer = null;
    this.hotNodeServer = null;
    this.config = config;

    const serverConfig = createNodeWebpack({
      config,
      mode: 'development',
      name: 'server',
    });
    const clientConfig = createBrowserWebpack({
      config,
      mode: 'development',
      name: 'client',
    });

    new Promise((resolve, reject) => {
      const compiler = createCompiler(clientConfig);
      compiler.plugin('done', stats => {
        if (!stats.hasErrors()) {
          resolve(compiler);
        } else {
          reject();
        }
      });
      this.hotClientServer = new HotClientServer(compiler, config);
    }).then(clientCompiler => {
      this.hotNodeServer = new HotNodeServer(
        createCompiler(serverConfig),
        clientCompiler,
      );
    });
  }
  shutdown() {
    // First the hot client server. Then dispose the hot node server.
    return handleShutdown(this.hotClientServer)
      .then(() => handleShutdown(this.hotNodeServer))
      .catch(error => {
        console.error(error);
      });
  }
}

export default BoldrDev;
