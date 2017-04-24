/* eslint-disable quote-props */
import path from 'path';

import EnvironmentPlugin from 'webpack/lib/EnvironmentPlugin';
import DefinePlugin from 'webpack/lib/DefinePlugin';
import OccurrenceOrderPlugin from 'webpack/lib/optimize/OccurrenceOrderPlugin';
import IgnorePlugin from 'webpack/lib/IgnorePlugin';
import LoaderOptionsPlugin from 'webpack/lib/LoaderOptionsPlugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import {removeNil, mergeDeep, ifElse} from 'boldr-utils';
import WebpackMd5Hash from 'webpack-md5-hash';
import paths from '../config/paths';
import getPostCSSConfig from '../config/postCSSconfig';

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
      modules: [paths.userNodeModules,  paths.srcDir, paths.boldrNodeModules],
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
      new WebpackMd5Hash(),
      new EnvironmentPlugin({
        NODE_ENV: isProd ? 'production' : 'development',
        DEBUG: JSON.stringify(process.env.DEBUG || false),
      }),
      new DefinePlugin({
        IS_DEV: JSON.stringify(isDev),
        IS_SERVER: JSON.stringify(isServer),
        IS_CLIENT: JSON.stringify(isClient),
        ASSETS_MANIFEST: JSON.stringify(
          path.join(paths.clientOutputPath || '',
          options.clientAssetsFile || ''),
        ),
      }),
      new CaseSensitivePathsPlugin(),
      new IgnorePlugin(/^\.\/locale$/, /moment$/),
      new LoaderOptionsPlugin({
        minimize: isProd,
        debug: !isProd,
        quiet: false,
        options: {
          postcss: getPostCSSConfig({}),
          context: paths.rootDir,
        },
      }),
    ]),

    module: {
      rules: [
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
