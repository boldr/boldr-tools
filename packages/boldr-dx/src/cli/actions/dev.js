/* eslint-disable prefer-const */
/* eslint-disable global-require */
import fs from 'fs';
import path from 'path';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'webpack-merge';
import shell from 'shelljs';
import webpack from 'webpack';
import chokidar from 'chokidar';
import md5 from 'md5';
import express from 'express';
import devMiddleware from 'webpack-dev-middleware';
import hotMiddleware from 'webpack-hot-middleware';
import nodemon from 'nodemon';
import Promise from 'bluebird';
import once from 'lodash/once';
import { logger } from 'boldr-utils';

const paths = require('../../config/paths');
const checkPort = require('../../utils/checkPort');
const compileConfigs = require('../../utils/compileConfigs');
const webpackCompiler = require('../../utils/webpackCompiler');

const boldrConfig = require(paths.USER_BOLDR_CONFIG_PATH);
const pkg = require(paths.USER_PKGJSON_PATH);

module.exports = (config, flags) => {
  logger.start('Starting development build...');

  // Kill the server on exit.
  process.on('SIGINT', process.exit);

  return new Promise.all([
    handleDlls(),
    startCompilation(),
  ]);

  function handleDlls() {
    logger.start('Starting DLLs plugin');

    const dllConfig = require(paths.DLL_CONFIG);


    const devDLLDependencies = dllConfig.sort();

    // We calculate a hash of the package.json's dependencies, which we can use
    // to determine if dependencies have changed since the last time we built
    // the vendor dll.
    const currentDependenciesHash = md5(JSON.stringify(
      devDLLDependencies.map(dep =>
        // We do this to include any possible version numbers we may have for
        // a dependency. If these change then our hash should too, which will
        // result in a new dev dll build.
        [dep, pkg.dependencies[dep], pkg.devDependencies[dep]],
      ),
    ));

    const vendorDLLHashFilePath = path.resolve(
      paths.DLL_DIR,
      '__boldr_dlls__hash',
    );

    function webpackConfigFactory() {
      return {
        // We only use this for development, so lets always include source maps.
        devtool: 'inline-source-map',
        entry: {
          ['__boldr_dlls__']: devDLLDependencies,
        },
        output: {
          path: paths.DLL_DIR,
          filename: '__boldr_dlls__.js',
          library: '__boldr_dlls__',
        },
        plugins: [
          new webpack.DllPlugin({
            path: path.resolve(
              paths.DLL_DIR,
              '__boldr_dlls__.json',
            ),
            name: '__boldr_dlls__',
          }),
        ],
      };
    }

    function buildVendorDLL() {
      return new Promise((resolve, reject) => {
        logger.info(`Vendor DLL build complete. The following dependencies have been
          included:\n\t-${devDLLDependencies.join('\n\t-')}\n`);

        const webpackConfig = webpackConfigFactory();
        const vendorDLLCompiler = webpack(webpackConfig);
        vendorDLLCompiler.run((err) => {
          if (err) {
            reject(err);
            return;
          }
            // Update the dependency hash
          fs.writeFileSync(vendorDLLHashFilePath, currentDependenciesHash);

          resolve();
        });
      });
    }

    return new Promise((resolve, reject) => {
      if (!fs.existsSync(vendorDLLHashFilePath)) {
        // builddll
        logger.warn('Generating a new Vendor DLL for boosted development performance.');
        buildVendorDLL().then(resolve).catch(reject);
      } else {
        // first check if the md5 hashes match
        const dependenciesHash = fs.readFileSync(vendorDLLHashFilePath, 'utf8');
        const dependenciesChanged = dependenciesHash !== currentDependenciesHash;

        if (dependenciesChanged) {
          logger.info('New vendor dependencies detected. Regenerating the vendor dll...');
          buildVendorDLL().then(resolve).catch(reject);
        } else {
          logger.info('Dependencies have not changed. Using the existing vendor dll.');
          resolve();
        }
      }
    });
  }

  function startCompilation() {
    let clientCompiler,
      serverCompiler;
    const { clientConfig, serverConfig } = compileConfigs(config);

    const {
      serverHost,
      serverPort,
      hmrPort,
      reactHotLoader,
      hasServer,
    } = config;
    const DEV_PORT = parseInt(hmrPort, 10);
    const afterClientCompile = once(() => {
      if (reactHotLoader) {
        logger.task('React Hot  ♨️  Loader enabled.');
      }
      logger.task('Starting up server');
      logger.task(`Client assets serving from ${clientCompiler.options.output.publicPath}`);
    });

    // Clean the build directory.
    if (shell.test('-d', paths.ASSETS_DIR) && shell.rm(`${paths.ASSETS_DIR}/*.*`).code === 0) {
      logger.task('Purged assets directory.');
    }
    if (shell.test('-d', paths.COMPILED_DIR) && shell.rm('-rf', `${paths.COMPILED_DIR}/*`).code === 0) {
      logger.task('Cleaned compiled server files. Ready for development!');
    }
    const startClient = () => {
      const app = express();
      const wpDevMwOpts = {
        quiet: true,
        noInfo: false,
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
      const webpackdevMiddleware = devMiddleware(clientCompiler, wpDevMwOpts);
      app.use(webpackdevMiddleware);
      app.use(hotMiddleware(clientCompiler));
      app.listen(DEV_PORT, serverHost);
    };

    const startServer = () => {
      const serverPaths = Object.keys(serverCompiler.options.entry)
        .map(entry => path.join(serverCompiler.options.output.path, `${entry}.js`));
      const mainPath = path.join(serverCompiler.options.output.path, 'main.js');

      const nodemonOpts = {
        script: mainPath,
        watch: serverPaths,
        nodeArgs: flags,
      };
      nodemon(nodemonOpts)
        .once('start', () => {
          logger.task(`Server running at: http://${serverHost}:${serverPort}`);
          logger.end('Development started');
        })
        .on('restart', () => logger.end('Development server restarted'))
        .on('quit', process.exit);
    };

    const compileServer = () => serverCompiler.run(() => undefined);

    // Compile Client Webpack Config
    clientCompiler = webpackCompiler(clientConfig, stats => {
      if (stats.hasErrors()) {
        return;
      }
      afterClientCompile();
      compileServer();
    });

    const watcher = chokidar.watch([paths.SERVER_SRC_DIR]);
    watcher.on('ready', () => {
      watcher
        .on('add', compileServer)
        .on('addDir', compileServer)
        .on('change', compileServer)
        .on('unlink', compileServer)
        .on('unlinkDir', compileServer);
    });

    const startServerOnce = once(() => {
      const PORT = parseInt(serverPort, 10);
      checkPort(PORT, startServer);
    });
    serverCompiler = webpackCompiler(serverConfig, stats => {
      if (stats.hasErrors()) return;
      startServerOnce();
    });
    checkPort(DEV_PORT, startClient);
  }
};
