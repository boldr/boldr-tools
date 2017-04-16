/* eslint-disable quote-props */
import path from 'path';

import webpack from 'webpack';
import chalk from 'chalk';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import {removeNil, mergeDeep, ifElse} from 'boldr-utils';
import paths from '../config/paths';
import getPostCSSConfig from '../config/postCSSconfig';
import {log, logError, logWarning, logSuccess} from '../utils/log';

const debug = require('debug')('boldr:webpack:base');

debug('Creating configuration.');
module.exports = options => {
  debug('webpack.base -- options: ', options);
  const isDev = options.environment === 'development';
  const isProd = options.environment === 'production';
  const isClient = options.type === 'client';
  const isServer = options.type === 'server';
  const isNode = !isClient;
  const ifDev = ifElse(isDev);
  const ifProd = ifElse(isProd);
  const ifNode = ifElse(isNode);

  return {
    cache: !isProd,
    resolve: {
      modules: [paths.userNodeModules, paths.boldrNodeModules, paths.srcDir],
      mainFields: ifNode(
        ['module', 'jsnext:main', 'main'],
        ['web', 'browser', 'style', 'module', 'jsnext:main', 'main'],
      ),
      extensions: ['.js', '.json', '.jsx', '.css', '.scss'],
    },
    // Locations Webpack should look for loaders.
    resolveLoader: {
      modules: [paths.boldrNodeModules, paths.userNodeModules, paths.srcDir],
      moduleExtensions: ['-loader'],
    },
    profile: isProd,
    bail: isProd,
    plugins: removeNil([
      new webpack.EnvironmentPlugin({
        NODE_ENV: isProd ? 'production' : 'development',
        DEBUG: JSON.stringify(process.env.DEBUG || false),
      }),
      new webpack.DefinePlugin({
        IS_DEV: JSON.stringify(isDev),
        IS_SERVER: JSON.stringify(isServer),
        IS_CLIENT: JSON.stringify(isClient),
        ASSETS_MANIFEST: JSON.stringify(
          path.join(paths.assetsDir || '', options.clientAssetsFile || ''),
        ),
      }),
      new CaseSensitivePathsPlugin(),
      new webpack.optimize.OccurrenceOrderPlugin(true),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new webpack.LoaderOptionsPlugin({
        minimize: isProd,
        debug: !isProd,
        quiet: false,
        options: {
          eslint: {
            configFile: path.join(paths.rootDir, './.eslintrc'),
            useEslintrc: true,
            failOnError: false,
          },
          postcss: getPostCSSConfig({}),
          context: paths.rootDir,
        },
      }),
    ]),

    module: {
      rules: [
        {
          parser: {
            requireEnsure: false,
          },
        },
        {
          test: /\.(js|jsx)$/,
          enforce: 'pre',
          loader: 'eslint-loader',
          include: paths.srcDir,
        },
        {
          test: /\.html$/,
          loader: 'file-loader?name=[name].[ext]',
        },
        {
          test: /\.woff(\?.*)?$/,
          loader: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff', // eslint-disable-line
        },
        {
          test: /\.woff2(\?.*)?$/,
          loader: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff2', // eslint-disable-line
        },
        {
          test: /\.otf(\?.*)?$/,
          loader: 'file?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=font/opentype', // eslint-disable-line
        },
        {
          test: /\.ttf(\?.*)?$/,
          loader: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/octet-stream', // eslint-disable-line
        },
        {
          test: /\.eot(\?.*)?$/,
          loader: 'file?prefix=fonts/&name=[path][name].[ext]',
        },
        {
          test: /\.svg(\?.*)?$/,
          loader: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=image/svg+xml', // eslint-disable-line
        },
        {test: /\.(png|jpg)$/, loader: 'url?limit=8192'},
      ],
    },
  };
};
