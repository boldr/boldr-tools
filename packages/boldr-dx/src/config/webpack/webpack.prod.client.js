import path from 'path';
import glob from 'glob';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import AssetsPlugin from 'assets-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import ChunkManifestPlugin from 'chunk-manifest-webpack-plugin';
import ManifestPlugin from 'webpack-manifest-plugin';
import BabiliWebpackPlugin from 'babili-webpack-plugin';
import PurifyCSSPlugin from 'purifycss-webpack';
import WebpackMd5Hash from 'webpack-md5-hash';
import paths from '../paths';

module.exports = options => ({
  target: 'web',
  devtool: 'hidden-source-map',
  profile: true,
  bail: true,
  entry: {
    main: [require.resolve('../polyfills'), `${paths.CLIENT_SRC_DIR}/index.js`],
  },
  output: {
    path: paths.ASSETS_DIR,
    pathinfo: true,
    filename: '[name]-[chunkhash].js',
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
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        exclude: [/node_modules/, paths.ASSETS_DIR],
        options: {
          babelrc: false,
          cacheDirectory: false,
          presets: [require.resolve('babel-preset-boldr/client')],
        },
      },
      {
        test: /(\.scss|\.css)$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: true,
                minimize: true,
                autoprefixer: false,
                importLoaders: 1,
                localIdentName: '[hash:base64]',
              },
            },
            {
              loader: 'postcss-loader',
            },
            {
              loader: 'sass-loader',
              options: {
                outputStyle: 'expanded',
                sourceMap: true,
              },
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

    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: module => /node_modules/.test(module.resource),
    }),
    new BabiliWebpackPlugin(),
    new PurifyCSSPlugin({
      paths: [
        ...glob.sync(`${paths.SHARED_DIR}/**/*.js`),
        ...glob.sync(`${paths.SHARED_DIR}/**/*.(scss|css)`),
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
      path: paths.ASSETS_DIR,
    }),
  ],
});
