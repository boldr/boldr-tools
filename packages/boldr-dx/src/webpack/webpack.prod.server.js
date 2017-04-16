import path from 'path';
import { statSync } from 'fs';
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';
import WebpackMd5Hash from 'webpack-md5-hash';
import paths from '../config/paths';

const debug = require('debug')('boldr:webpack:server');

module.exports = options => {
  debug('webpack.server -- options: ', options);
  return {
    target: 'node',
    externals: [
      nodeExternals({
        whitelist: [
          /\.(eot|woff|woff2|ttf|otf)$/,
          /\.(svg|png|jpg|jpeg|gif|ico)$/,
          /\.(mp4|mp3|ogg|swf|webp)$/,
          /\.(css|scss|sass|styl|less)$/,
          'source-map-support/register',
        ],
      }),
    ],

    entry: {
      main: [`${paths.serverSrcDir}/index.js`],
    },
    output: {
      path: paths.compiledDir,
      filename: '[name].js',
      pathinfo: false,
      chunkFilename: '[name]-[chunkhash].js',
      publicPath: options.publicPath,
      libraryTarget: 'commonjs2',
    },

    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          loader: 'babel-loader',
          exclude: [
            /node_modules/,
            paths.compiledDir,
            paths.assetsDir,
            paths.happyPackDir,
          ],
          include: [paths.srcDir],
          options: {
            babelrc: false,
            cacheDirectory: false,
            presets: [require.resolve('babel-preset-boldr/server')],
            plugins: [require.resolve('babel-plugin-dynamic-import-node')],
          },
        },
        {
          test: /\.(scss|css)$/,
          use: [
            {
              loader: 'css-loader/locals',
            },
            {
              loader: 'postcss-loader',
            },
            {
              loader: 'fast-sass-loader',
            },
          ],
        },
      ],
    },

    plugins: [
      new webpack.optimize.OccurrenceOrderPlugin(true),
      new webpack.BannerPlugin({
        banner: 'require("source-map-support").install();',
        raw: true,
        entryOnly: true,
      }),
    ],
  };
};
