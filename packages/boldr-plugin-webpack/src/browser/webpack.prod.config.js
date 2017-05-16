/* @flow */

import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import BabiliPlugin from 'babili-webpack-plugin';
import AssetsPlugin from 'assets-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import ChunkManifestPlugin from 'chunk-manifest-webpack-plugin';
import WebpackMd5Hash from 'webpack-md5-hash';
import postCssImport from 'postcss-import';
import autoprefixer from 'autoprefixer';
import discardComments from 'postcss-discard-comments';
import reporter from 'postcss-reporter';

import defineVariables from '../utils/defineVariables';
import getExcludes from '../utils/getExcludes';
import {
  NODE_OPTS,
  LOCAL_IDENT,
  BUNDLE_EXTENSIONS,
  BROWSER_MAIN,
} from '../utils/constants';

const PATHS = require('../utils/paths');

const prefetches = [];

const prefetchPlugins = prefetches.map(
  specifier => new webpack.PrefetchPlugin(specifier),
);

module.exports = function createConfig(
  engine: Engine,
  logger: LogGroup,
): Object {
  const {
    inline: envVariables,
    settings,
  }: ClientWebpackPluginConfiguration = engine.getConfiguration();

  const clientSettings = settings.bundle.client;
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

  const VARIABLES_TO_INLINE = {
    'process.env': defineVariables(envVariables, { IS_CLIENT: true }),
  };

  return {
    context: process.cwd(),
    entry: {
      app: clientSettings.entry,
      vendor: settings.bundle.vendor,
    },
    output: {
      path: clientSettings.bundleDir,
      pathinfo: false,
      filename: '[name]-[chunkhash].js',
      publicPath: settings.webPath || '/assets/',
    },
    resolve: {
      modules: ['node_modules', PATHS.projectNodeModules].concat(
        PATHS.nodePaths,
      ),
      extensions: BUNDLE_EXTENSIONS,
      descriptionFiles: ['package.json'],
      mainFields: BROWSER_MAIN,
      alias: {
        react: require.resolve('react/dist/react.min.js'),
        'react-dom': require.resolve('react-dom/dist/react-dom.min.js'),
      },
    },
    // resolve loaders from this plugin directory
    resolveLoader: {
      modules: [PATHS.boldrNodeModules, PATHS.projectNodeModules],
    },
    bail: true,
    profile: settings.wpProfile,
    devtool: 'source-map',
    node: NODE_OPTS,

    plugins: [
      // loader options
      new webpack.LoaderOptionsPlugin({
        debug: false,
        minimize: true,
        context: '/',
      }),

      new webpack.HashedModuleIdsPlugin(),
      new WebpackMd5Hash(),
      // define global variable
      new webpack.DefinePlugin(VARIABLES_TO_INLINE),

      new BabiliPlugin({}, { comments: false }),

      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: module =>
          module.context && module.context.includes('node_modules'),
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        minChunks: Infinity,
      }),
      new webpack.optimize.CommonsChunkPlugin({
        async: true,
        children: true,
        minChunks: 4,
      }),
      new ExtractTextPlugin({
        filename: '[name]-[contenthash:8].css',
        allChunks: true,
        ignoreOrder: settings.cssModules,
      }),

      new AssetsPlugin({
        filename: 'assets.json',
        path: clientSettings.bundleDir,
        prettyPrint: true,
      }),
      new ChunkManifestPlugin({
        filename: settings.chunkManifestFileName,
        manifestVariable: 'CHUNK_MANIFEST',
      }),
      new webpack.optimize.AggressiveMergingPlugin(),
      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        analyzerMode: 'static',
        logLevel: 'error',
      }),
      // Custom plugins
      ...plugins.map(pluginInstantiator =>
        pluginInstantiator(engine.getConfiguration(), VARIABLES_TO_INLINE),
      ),
    ],
    module: {
      strictExportPresence: true,
      rules: decorateLoaders([
        { parser: { requireEnsure: false } },
        // js
        {
          test: /\.(js|jsx)$/,
          include: settings.srcDir,
          exclude: getExcludes(settings),
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
                plugins: [
                  [
                    require.resolve('../utils/loadableBabel.js'),
                    {
                      server: true,
                      webpack: true,
                    },
                  ],
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
                  context: settings.srcDir,
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
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 2,
                  localIdentName: '[hash:base64:5]',
                  context: settings.srcDir,
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
          test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
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
