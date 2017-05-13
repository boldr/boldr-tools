/* @flow */

import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import BabiliPlugin from 'babili-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import ChunkManifestPlugin from 'chunk-manifest-webpack-plugin';
import WebpackMd5Hash from 'webpack-md5-hash';
import postCssImport from 'postcss-import';
import autoprefixer from 'autoprefixer';
import discardComments from 'postcss-discard-comments';
import reporter from 'postcss-reporter';

import defineVariables from '../../utils/defineVariables';
import AssetsPlugin from '../plugins/AssetsPlugin';
import LoggerPlugin from '../plugins/LoggerPlugin';

const PATHS = require('../pathUtils');

const prefetches = [];

const prefetchPlugins = prefetches.map(
  specifier => new webpack.PrefetchPlugin(specifier),
);

module.exports = function createConfig(
  engine: Engine,
  logger: LogGroup,
): Object {
  const {
    env: envVariables,
    settings,
  }: ClientWebpackPluginConfiguration = engine.getConfiguration();

  const clientSettings = settings.client;
  // $FlowIssue : Not really an issue.
  let plugins: () => any[] = [];
  let decorateLoaders: (loaders: Array<any>) => any = loaders => loaders;

  const pluginsInstatiators =
    clientSettings.webpackPlugins && clientSettings.webpackPlugins.production;

  if (Array.isArray(pluginsInstatiators)) {
    plugins = pluginsInstatiators;
  }

  const loadersDecorator =
    clientSettings.webpack &&
    clientSettings.webpack.loadersDecorator &&
    clientSettings.webpack.loadersDecorator.production;

  if (typeof loadersDecorator === 'function') {
    decorateLoaders = loadersDecorator;
  }

  const inlineVariables = {
    'process.env': defineVariables(envVariables, { IS_CLIENT: true }),
  };

  return {
    context: process.cwd(),
    entry: [settings.client.index],
    output: {
      path: settings.client.bundleDir,
      pathinfo: true,
      filename: '[name]-[chunkhash].js',
      publicPath: settings.client.publicPath || '/',
    },
    resolve: {
      modules: ['node_modules', settings.projectNodeModules].concat(
        PATHS.nodePaths,
      ),
      extensions: ['.js', '.json', '.jsx', '.css', '.scss'],
      descriptionFiles: ['package.json'],
      mainFields: ['web', 'browser', 'style', 'module', 'jsnext:main', 'main'],
    },
    // resolve loaders from this plugin directory
    resolveLoader: {
      modules: [PATHS.boldrNodeModules, PATHS.projectNodeModules],
    },
    bail: true,
    profile: settings.wpProfile,
    devtool: 'source-map',
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
    },

    plugins: [
      // loader options
      new webpack.LoaderOptionsPlugin({
        debug: false,
        minimize: true,
        context: '/',
      }),

      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: module => /node_modules/.test(module.resource),
      }),
      new webpack.HashedModuleIdsPlugin(),
      new WebpackMd5Hash(),
      // define global variable
      new webpack.DefinePlugin(inlineVariables),

      new BabiliPlugin({}, { comments: false }),

      new ExtractTextPlugin({
        filename: '[name]-[contenthash:8].css',
        allChunks: true,
        ignoreOrder: settings.cssModules,
      }),

      new AssetsPlugin(engine),

      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        analyzerMode: 'static',
        logLevel: 'error',
      }),

      new LoggerPlugin(logger),

      // Custom plugins
      ...plugins.map(pluginInstantiator =>
        pluginInstantiator(engine.getConfiguration(), inlineVariables),
      ),
    ],
    module: {
      rules: decorateLoaders([
        { parser: { requireEnsure: false } },
        // js
        {
          test: /\.(js|jsx)$/,
          include: settings.projectSrcDir,
          use: [
            {
              loader: 'babel-loader',
              options: {
                babelrc: false,
                sourceMaps: false,
                comments: false,
                presets: [
                  settings.babelrc ||
                    require.resolve('babel-preset-boldr/browser'),
                ],
              },
            },
          ],
        },

        // css
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {
                  modules: settings.cssModules,
                  minimize: false,
                  autoprefixer: false,
                  importLoaders: 1,
                  // "context" and "localIdentName" need to be the same with client config,
                  // or the style will flick when page first loaded
                  context: settings.projectSrcDir,
                  localIdentName: '[hash:base64:5]',
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  // https://webpack.js.org/guides/migrating/#complex-options
                  ident: 'postcss',
                  plugins: () => [
                    postCssImport(),
                    discardComments({
                      removeAll: true,
                    }),
                    autoprefixer({
                      browsers: ['>1%', 'last 2 versions'],
                    }),
                    reporter({
                      clearReportedMessages: true,
                    }),
                  ],
                },
              },
            ],
          }),
        },
        // Sass
        {
          test: /\.scss$/,
          loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 2,
                  localIdentName: '[hash:base64:5]',
                  context: settings.projectSrcDir,
                  sourceMap: true,
                  modules: false,
                },
              },
              { loader: 'postcss-loader', options: { sourceMap: true } },
              {
                loader: 'sass-loader',
                options: {
                  outputStyle: 'expanded',
                  sourceMap: true,
                  sourceMapContents: true,
                },
              },
            ],
          }),
        },
        // json
        {
          test: /\.json$/,
          loader: 'json-loader',
        },
        // url
        {
          test: /\.(woff2?|png|jpg|gif|jpeg|ttf|eot|mp4|webm|wav|mp3|m4a|aac|oga)(\?.*)?$/,
          loader: 'url-loader',
          options: { limit: 10000 },
        },
        {
          test: /\.svg(\?v=\d+.\d+.\d+)?$/,
          loader: 'url-loader?limit=10000&mimetype=image/svg+xml&name=[name].[ext]', // eslint-disable-line
        },
        // file
        {
          test: /\.(ico|eot|ttf|otf|mp4|mp3|ogg|pdf|html)$/, // eslint-disable-line
          loader: 'file-loader',
          options: {
            name: 'file-[hash:base64:5].[ext]',
            emitFile: true,
          },
        },
      ]),
    },
  };
};
