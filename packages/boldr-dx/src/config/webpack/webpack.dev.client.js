/* eslint-disable global-require */
import path from 'path';
import webpack from 'webpack';
import AssetsPlugin from 'assets-webpack-plugin';
import CircularDependencyPlugin from 'circular-dependency-plugin';
import ManifestPlugin from 'webpack-manifest-plugin';
import WebpackMd5Hash from 'webpack-md5-hash';

const postCssImport = require('postcss-import');
const postCssCssNext = require('postcss-cssnext');
const happyPackPlugin = require('../../utils/happyPackPlugin');
const paths = require('../paths');

const nodeEnv = process.env.NODE_ENV || 'development';

module.exports = options => {
  const main = [
    'react-hot-loader/patch',
    `webpack-hot-middleware/client?reload=true&?overlay=true&path=http://${options.serverHost}:${options.hmrPort}/__webpack_hmr`,
    require.resolve('../polyfills'),
    `${paths.CLIENT_SRC_DIR}/index.js`,
  ];
  const boldrCfgPath = require(paths.USER_BOLDR_CONFIG_PATH);

  return {
    target: 'web',
    devtool: 'cheap-module-eval-source-map',
    entry: {
      main,
    },

    output: {
      path: paths.ASSETS_DIR,
      filename: '[name].js',
      pathinfo: true,
      chunkFilename: '[name]-[chunkhash].js',
      publicPath: options.publicPath,
      libraryTarget: 'var',
    },
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      dirname: true,
    },
    plugins: [
      new WebpackMd5Hash(),
      happyPackPlugin('happyjs', [
        {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            compact: true,
            cacheDirectory: true,
            presets: [require.resolve('babel-preset-boldr/client')],
            plugins: [require.resolve('react-hot-loader/babel')],
          },
        },
      ]),
      happyPackPlugin('happystyle', [
        {
          loader: 'style-loader',
        },
        {
          loader: 'css-loader',
          options: {
            autoprefixer: false,
            modules: true,
            importLoaders: true,
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
        path: paths.ASSETS_DIR,
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
          exclude: [/node_modules/, paths.ASSETS_DIR],
        },
        {
          test: /(\.scss|\.css)$/,
          loader: 'happypack/loader',
          options: {
            id: 'happystyle',
          },
        },
      ],
    },
  };
};
