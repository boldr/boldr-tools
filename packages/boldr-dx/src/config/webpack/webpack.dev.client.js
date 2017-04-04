/* eslint-disable global-require */
import path from 'path';
import { statSync } from 'fs';
import webpack from 'webpack';
import appRootDir from 'app-root-dir';
import AssetsPlugin from 'assets-webpack-plugin';

import CircularDependencyPlugin from 'circular-dependency-plugin';
import ManifestPlugin from 'webpack-manifest-plugin';
import WebpackMd5Hash from 'webpack-md5-hash';
import happyPackPlugin from '../../utils/happyPackPlugin';
import paths from '../paths';

const nodeEnv = process.env.NODE_ENV || 'development';
const HMR_PORT = process.env.HMR_PORT || 3001;
const SERVER_HOST = process.env.SERVER_HOST || 'localhost';
const rootDir = appRootDir.get();

module.exports = options => {
  const main = [
    `webpack-hot-middleware/client?reload=true&?overlay=true&path=http://${options.serverHost}:${options.hmrPort}/__webpack_hmr`, // eslint-disable-line
    `${paths.clientSrcDir}/index.js`,
  ];
  const boldrCfgPath = require(paths.userBoldrConfigPath);

  return {
    target: 'web',
    devtool: 'cheap-module-eval-source-map',
    entry: {
      main,
    },
    output: {
      path: paths.assetsDir,
      filename: '[name].js',
      pathinfo: true,
      chunkFilename: '[name]-[chunkhash].js',
      publicPath: options.publicPath,
      libraryTarget: 'var',
    },
    plugins: [
      happyPackPlugin('happyjs', [
        {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            compact: true,
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
          loader: 'sass-loader',
          options: {
            sourceMap: true,
          },
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
      new webpack.EnvironmentPlugin({
        NODE_ENV: JSON.stringify(nodeEnv),
      }),
      // Prevent webpack errors during development in order to keep our process alive.
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
          exclude: [/node_modules/, /happypack/, paths.assetsDir],
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
