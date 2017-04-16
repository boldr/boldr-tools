/* eslint-disable global-require */
import path from 'path';
import {statSync} from 'fs';
import webpack from 'webpack';
import AssetsPlugin from 'assets-webpack-plugin';
import CircularDependencyPlugin from 'circular-dependency-plugin';
import ManifestPlugin from 'webpack-manifest-plugin';
import WebpackMd5Hash from 'webpack-md5-hash';

import paths from '../config/paths';
import happyPackPlugin from './plugins/happyPackPlugin';

const nodeEnv = process.env.NODE_ENV || 'development';
const HMR_PORT = process.env.HMR_PORT || 3001;
const SERVER_HOST = process.env.SERVER_HOST || 'localhost';
const debug = require('debug')('boldr:webpack:client');

module.exports = options => {
  debug('webpack.client -- options: ', options);
  const main = [
    'react-hot-loader/patch',
    `webpack-hot-middleware/client?reload=true&&path=http://${options.serverHost}:${options.hmrPort}/__webpack_hmr`, // eslint-disable-line
    `${paths.clientSrcDir}/index.js`,
  ];
  const boldrCfgPath = require(paths.boldrConfigPath);

  return {
    target: 'web',
    devtool: 'cheap-module-eval-source-map',
    entry: {
      main,
    },
    output: {
      path: paths.assetsDir,
      filename: 'main.js',
      pathinfo: true,
      chunkFilename: '[name]-[chunkhash].js',
      publicPath: options.publicPath,
    },
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
    },
    plugins: [
      happyPackPlugin('happyjs', [
        {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            compact: true,
            sourceMaps: true,
            comments: false,
            cacheDirectory: true,
            presets: [require.resolve('babel-preset-boldr/client')],
            plugins: [require.resolve('babel-plugin-dynamic-import-webpack')],
          },
        },
      ]),
      happyPackPlugin('happyscss', [
        {
          loader: 'style-loader',
        },
        {
          loader: 'css-loader',
          options: {
            autoprefixer: false,
            modules: false,
            importLoaders: 2,
            localIdentName: '[name]__[local]__[hash:base64:5]',
          },
        },
        {
          loader: 'postcss-loader',
        },
        {
          loader: 'fast-sass-loader',
        },
      ]),
      happyPackPlugin('happycss', [
        {
          loader: 'style-loader',
        },
        {
          loader: 'css-loader',
          options: {
            autoprefixer: false,
            modules: true,
            importLoaders: 1,
            localIdentName: '[name]__[local]__[hash:base64:5]',
          },
        },
        {
          loader: 'postcss-loader',
        },
      ]),
      new WebpackMd5Hash(),
      // Prevent webpack errors during development in order to
      // keep our process alive.
      new webpack.NoEmitOnErrorsPlugin(),
      new CircularDependencyPlugin({
        exclude: /a\.js|node_modules/,
        // show a warning when there is a circular dependency
        failOnError: false,
      }),
      // Prints more readable module names in the browser console on HMR updates
      new webpack.NamedModulesPlugin(),
      // Generates a JSON file containing a map of all the output files
      new AssetsPlugin({
        filename: options.clientAssetsFile,
        path: paths.assetsDir,
        prettyPrint: true,
      }),
      new webpack.HotModuleReplacementPlugin(),
    ],
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          loader: 'happypack/loader',
          options: {
            id: 'happyjs',
          },
          exclude: [
            /node_modules/,
            paths.happyPackDir,
            paths.assetsDir,
            paths.compiledDir,
          ],
          include: [paths.srcDir],
        },
        {
          test: /\.scss$/,
          loader: 'happypack/loader',
          options: {
            id: 'happyscss',
          },
        },
        {
          test: /\.css$/,
          loader: 'happypack/loader',
          options: {
            id: 'happycss',
          },
        },
      ],
    },
  };
};
