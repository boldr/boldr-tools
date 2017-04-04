import path from 'path';
import { statSync } from 'fs';
import appRootDir from 'app-root-dir';
import webpack from 'webpack';
import WebpackMd5Hash from 'webpack-md5-hash';
import nodeExternals from 'webpack-node-externals';
import { removeNil, mergeDeep, ifElse } from 'boldr-utils';
import paths from '../paths';

const rootDir = appRootDir.get();

module.exports = options => {
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
      pathinfo: true,
      chunkFilename: '[name]-[chunkhash].js',
      publicPath: options.publicPath,
      libraryTarget: 'commonjs2',
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          loader: 'babel-loader',
          exclude: [/node_modules/, paths.compiledDir, paths.assetsDir, /happypack/],
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
              loader: 'sass-loader',
            },
          ],
        },
      ],
    },

    plugins: [
      new WebpackMd5Hash(),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      new webpack.BannerPlugin({
        banner: 'require("source-map-support").install();',
        raw: true,
        entryOnly: true,
      }),
    ],
  };
};
