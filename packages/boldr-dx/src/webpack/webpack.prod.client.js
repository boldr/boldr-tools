import path from 'path';
import glob from 'glob';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import AssetsPlugin from 'assets-webpack-plugin';
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer';
import ChunkManifestPlugin from 'chunk-manifest-webpack-plugin';
import ManifestPlugin from 'webpack-manifest-plugin';
import BabiliWebpackPlugin from 'babili-webpack-plugin';
import PurifyCSSPlugin from 'purifycss-webpack';
import WebpackMd5Hash from 'webpack-md5-hash';

import paths from '../config/paths';

const debug = require('debug')('boldr:webpack:client');

module.exports = options => {
  debug('webpack.client -- options: ', options);
  return {
    target: 'web',
    devtool: 'hidden-source-map',
    entry: {
      main: [
        require.resolve('../config/polyfills'),
        `${paths.clientSrcDir}/index.js`,
      ],
    },
    output: {
      path: paths.assetsDir,
      pathinfo: false,
      filename: '[name]-[chunkhash].js',
      chunkFilename: '[name]-[chunkhash].js',
      publicPath: options.publicPath,
      libraryTarget: 'var',
    },
    node: {
      __dirname: true,
      __filename: true,
      fs: 'empty',
      global: true,
      crypto: 'empty',
      process: true,
      module: false,
      clearImmediate: false,
      setImmediate: false,
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          loader: 'babel-loader',
          exclude: [/node_modules/, paths.assetsDir],
          options: {
            babelrc: false,
            cacheDirectory: false,
            presets: [require.resolve('babel-preset-boldr/client')],
            plugins: [require.resolve('babel-plugin-dynamic-import-webpack')],
          },
        },
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
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
            ],
          }),
        },
        {
          test: /\.scss$/,
          loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {
                  modules: false,
                  minimize: true,
                  autoprefixer: false,
                  importLoaders: 2,
                  localIdentName: '[hash:base64]',
                },
              },
              {
                loader: 'postcss-loader',
              },
              {
                loader: 'fast-sass-loader',
              },
            ],
          }),
        },
      ],
    },

    plugins: [
      new WebpackMd5Hash(),
      new ExtractTextPlugin({
        filename: '[name]-[chunkhash].css',
        allChunks: true,
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: module => /node_modules/.test(module.resource),
      }),
      new BabiliWebpackPlugin(),
      new PurifyCSSPlugin({
        paths: [
          ...glob.sync(`${paths.sharedDir}/**/*.js`),
          ...glob.sync(`${paths.sharedDir}/**/*.(scss|css)`),
        ],
        styleExtensions: ['.css', '.scss'],
        moduleExtensions: [],
        purifyOptions: {
          minify: true,
          info: true,
          rejected: true,
        },
      }),
      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        analyzerMode: 'static',
        logLevel: 'error',
      }),
      new webpack.HashedModuleIdsPlugin(),

      new webpack.optimize.AggressiveMergingPlugin(),
      new ManifestPlugin({
        fileName: 'asset-manifest.json',
      }),
      new ChunkManifestPlugin({
        filename: 'manifest.json',
        manifestVariable: 'CHUNK_MANIFEST',
      }),
      new AssetsPlugin({
        filename: options.clientAssetsFile,
        path: paths.assetsDir,
      }),
    ],
  };
};
