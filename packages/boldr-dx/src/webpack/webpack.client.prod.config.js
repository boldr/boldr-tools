import path from 'path';
import glob from 'glob';
import UglifyJsPlugin from 'webpack/lib/optimize/UglifyJsPlugin';
import CommonsChunkPlugin from 'webpack/lib/optimize/CommonsChunkPlugin';
import HashedModuleIdsPlugin from 'webpack/lib/HashedModuleIdsPlugin';
import AggressiveMergingPlugin
  from 'webpack/lib/optimize/AggressiveMergingPlugin'; // eslint-disable-line
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import AssetsPlugin from 'assets-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import ChunkManifestPlugin from 'chunk-manifest-webpack-plugin';
import ManifestPlugin from 'webpack-manifest-plugin';
import paths from '../config/paths';

const debug = require('debug')('boldr:webpack:client');

const boldrConfig = require(paths.boldrConfigPath);

module.exports = options => {
  debug('webpack.client -- options: ', options);
  return {
    target: 'web',
    devtool: 'hidden-source-map',
    entry: {
      main: [require.resolve('../config/polyfills'), paths.clientEntryPath],
      vendor: boldrConfig.vendorFiles,
    },
    output: {
      path: paths.clientOutputPath,
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
          exclude: [/node_modules/, paths.assetsDir, paths.happyPackDir],
          options: {
            babelrc: false,
            cacheDirectory: false,
            presets: [require.resolve('babel-preset-boldr/client')],
            plugins: [
              [
                require.resolve('../utils/reactLoadableBabel.js'),
                {
                  server: true,
                  webpack: true,
                },
              ],
            ],
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
      new ExtractTextPlugin({
        filename: '[name]-[chunkhash].css',
        allChunks: true,
      }),
      new CommonsChunkPlugin({
        name: 'vendor',
        minChunks: module => /node_modules/.test(module.resource),
      }),
      new UglifyJsPlugin({
        compress: {
          screw_ie8: true, // eslint-disable-line
          warnings: false,
        },
        output: {
          comments: false,
        },
        sourceMap: true,
      }),
      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        analyzerMode: 'static',
        logLevel: 'error',
      }),
      new HashedModuleIdsPlugin(),

      new AggressiveMergingPlugin(),
      new ManifestPlugin({
        fileName: 'asset-manifest.json',
      }),
      new ChunkManifestPlugin({
        filename: 'manifest.json',
        manifestVariable: 'CHUNK_MANIFEST',
      }),
      new AssetsPlugin({
        filename: options.clientAssetsFile,
        path: paths.clientOutputPath,
      }),
    ],
  };
};
