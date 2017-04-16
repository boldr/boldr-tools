/* eslint-disable prefer-const, global-require, babel/new-cap */

import path from 'path';
import fs from 'fs-extra';
import cloneDeep from 'lodash/cloneDeep';
import chalk from 'chalk';
import merge from 'webpack-merge';
import shell from 'shelljs';
import chokidar from 'chokidar';
import express from 'express';
import devMiddleware from 'webpack-dev-middleware';
import hotMiddleware from 'webpack-hot-middleware';
import nodemon from 'nodemon';
import Promise from 'bluebird';
import once from 'lodash/once';
import logger from 'boldr-utils/es/logger';

import buildWebpackDlls from '../services/buildWebpackDlls';
import paths from '../config/paths';
import checkPort from '../utils/checkPort';
import compileConfigs from '../services/compileConfigs';
import webpackCompiler from '../services/webpackCompiler';

const debug = require('debug')('boldr:webpack:dev');

const boldrConfig = require(paths.boldrConfigPath);
const pkg = require(paths.userPkgPath);

debug('Running dev CLI command.');
module.exports = (config, flags) => {
  logger.start('Starting development process...');

  // Kill the server on exit.
  process.on('SIGINT', process.exit);

  return new Promise.all([buildWebpackDlls(), startCompilation()]);

  function startCompilation() {
    let clientCompiler, serverCompiler;
    const {clientConfig, serverConfig} = compileConfigs(config);

    const {serverHost, serverPort, hmrPort, hasServer} = config;
    // 3001
    const DEV_PORT = parseInt(hmrPort, 10);
    const afterClientCompile = once(() => {
      logger.task('Compiled client bundle.');
      logger.info('Bringing server online 🌐');
      logger.info(`Client assets: ${clientCompiler.options.output.publicPath}`);
    });

    const launchClientDevServer = () => {
      const app = express();
      const webpackDevMwOptions = {
        quiet: false,
        noInfo: true,
        stats: {
          colors: true,
        },
        lazy: false,
        hot: true,
        serverSideRender: true,
        watchOptions: {
          aggregateTimeout: 300,
          poll: true,
          ignored: [/node_modules/],
        },
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        publicPath: clientCompiler.options.output.publicPath,
      };

      const webpackdevMiddleware = devMiddleware(
        clientCompiler,
        webpackDevMwOptions,
      );
      app.use(webpackdevMiddleware);
      app.use(hotMiddleware(clientCompiler));
      // 3001
      app.listen(DEV_PORT);
    };

    const startNodeServer = () => {
      const serverPaths = Object.keys(serverCompiler.options.entry).map(entry =>
        path.join(serverCompiler.options.output.path, `${entry}.js`),
      );
      const mainPath = path.join(serverCompiler.options.output.path, 'main.js');

      const nodemonOpts = {
        script: mainPath,
        watch: serverPaths,
        verbose: true,
        stdout: true,
        nodeArgs: flags,
      };
      nodemon(nodemonOpts)
        .once('start', () => {
          logger.task('Server bundle built.');
          logger.info(`Server running at: http://${serverHost}:${serverPort}`);
          logger.end('Dev servers online. Ready for coding.');
        })
        .on('restart', () => logger.info('Development server restarted'))
        .on('quit', process.exit);
    };

    const compileServer = () => serverCompiler.run(() => undefined);

    // Compile Client Webpack Config
    clientCompiler = webpackCompiler(clientConfig, stats => {
      if (stats.hasErrors()) {
        debug('💩  clientCompiler:', stats);
        logger.error(stats);
        return;
      }
      afterClientCompile();
      compileServer();
    });

    const watcher = chokidar.watch([paths.serverSrcDir]);
    watcher.on('ready', () => {
      watcher
        .on('add', compileServer)
        .on('addDir', compileServer)
        .on('change', compileServer)
        .on('unlink', compileServer)
        .on('unlinkDir', compileServer);
    });

    const startNodeServerOnce = once(() => {
      // 3000
      const PORT = parseInt(serverPort, 10);
      checkPort(PORT, startNodeServer);
    });
    serverCompiler = webpackCompiler(serverConfig, stats => {
      if (stats.hasErrors()) {
        debug('💩  serverCompiler:', stats);
        logger.error(stats);
        return;
      }
      startNodeServerOnce();
    });
    // 3001
    checkPort(DEV_PORT, launchClientDevServer);
  }
};
