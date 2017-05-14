/* @flow */
import path from 'path';
import webpack from 'webpack';
import NamedModulesPlugin from 'webpack/lib/NamedModulesPlugin';
import findCacheDir from 'find-cache-dir';
import AssetsPlugin from 'assets-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import postCssImport from 'postcss-import';
import autoprefixer from 'autoprefixer';
import discardComments from 'postcss-discard-comments';
import reporter from 'postcss-reporter';

import WatchMissingNodeModulesPlugin
  from 'react-dev-utils/WatchMissingNodeModulesPlugin';

import defineVariables from '../utils/defineVariables';
import LoggerPlugin from '../plugins/LoggerPlugin';
import getExcludes from '../utils/getExcludes';
import {
  NODE_OPTS,
  LOCAL_IDENT,
  BUNDLE_EXTENSIONS,
  BROWSER_MAIN,
} from '../utils/constants';

const PATHS = require('../utils/paths');

const DEV_SERVER_PORT = parseInt(process.env.DEV_SERVER_PORT, 10) || 3001;
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
    clientSettings.webpackPlugins && clientSettings.webpackPlugins.development;

  if (Array.isArray(pluginsInstatiators)) {
    plugins = pluginsInstatiators;
  }

  const loadersDecorator =
    clientSettings.webpack &&
    clientSettings.webpack.loadersDecorator &&
    clientSettings.webpack.loadersDecorator.development;

  if (typeof loadersDecorator === 'function') {
    decorateLoaders = loadersDecorator;
  }

  const VARIABLES_TO_INLINE = {
    'process.env': defineVariables(envVariables, { IS_CLIENT: true }),
  };

  return {
    context: process.cwd(),
    devtool: 'eval',
    // was entry: [`${require.resolve('react-dev-utils/webpackHotDevClient')}`, settings.client.index]
    entry: {
      app: [
        `${require.resolve('webpack-dev-server/client')}?http://localhost:${DEV_SERVER_PORT}`,
        require.resolve('webpack/hot/dev-server'),
        settings.client.entry,
      ],
    },
    output: {
      path: settings.client.bundleDir,
      pathinfo: true,
      filename: '[name].js',
      publicPath: `http://localhost:${DEV_SERVER_PORT}${settings.webPath}`,
    },
    resolve: {
      modules: ['node_modules', settings.projectNodeModules].concat(
        PATHS.nodePaths,
      ),
      extensions: BUNDLE_EXTENSIONS,
      descriptionFiles: ['package.json'],
      mainFields: BROWSER_MAIN,
    },
    // resolve loaders from this plugin directory
    resolveLoader: {
      modules: [PATHS.boldrNodeModules, PATHS.projectNodeModules],
    },
    node: NODE_OPTS,
    bail: false,
    profile: false,
    devServer: {
      clientLogLevel: 'none',
      disableHostCheck: true,
      contentBase: envVariables.PUBLIC_DIR,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      historyApiFallback: true,
      compress: true,
      host: 'localhost',
      port: DEV_SERVER_PORT,
      hot: true,
      publicPath: settings.webPath,
      quiet: true,
      watchOptions: {
        ignored: /node_modules/,
      },
    },
    plugins: [
      ...prefetchPlugins,

      new webpack.LoaderOptionsPlugin({
        minimize: false,
        debug: true,
        context: '/',
      }),

      new AssetsPlugin({
        filename: 'assets.json',
        path: settings.assetsDir,
        prettyPrint: true,
      }),
      new NamedModulesPlugin(),
      // Each key passed into DefinePlugin AND/OR EnvironmentPlugin is an identifier.
      // @NOTE EnvironmentPlugin allows you to skip writing process.env for each
      // definition. It is the same thing as DefinePlugin.
      //
      // The values for each key will be inlined into the code replacing any
      // instances of the keys that are found.
      // If the value is a string it will be used as a code fragment.
      // If the value isn’t a string, it will be stringified
      new webpack.DefinePlugin(VARIABLES_TO_INLINE),

      // case sensitive paths
      new CaseSensitivePathsPlugin(),
      // Errors during development will kill any of our NodeJS processes.
      // this prevents that from happening.
      new webpack.NoEmitOnErrorsPlugin(),
      //  We need this plugin to enable hot module reloading
      new webpack.HotModuleReplacementPlugin(),

      // watch missing node modules
      new WatchMissingNodeModulesPlugin(settings.projectNodeModules),

      // Logger plugin
      new LoggerPlugin(logger),
      // Custom plugins
      ...plugins.map(pluginInstantiator =>
        pluginInstantiator(engine.getConfiguration(), VARIABLES_TO_INLINE),
      ),
    ],
    module: {
      rules: decorateLoaders([
        { parser: { requireEnsure: false } },
        // js
        {
          test: /\.(js|jsx)$/,
          include: settings.srcDir,
          exclude: getExcludes(settings),
          use: [
            {
              loader: 'cache-loader',
              options: {
                // provide a cache directory where cache items should be stored
                cacheDirectory: findCacheDir({
                  name: 'boldr-cache',
                }),
              },
            },
            {
              loader: 'babel-loader',
              options: {
                babelrc: false,
                compact: true,
                sourceMaps: true,
                comments: false,
                cacheDirectory: findCacheDir({
                  name: 'boldr-cache',
                }),
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
          exclude: getExcludes(settings),
          use: [
            { loader: 'style-loader' },
            {
              loader: 'css-loader',
              options: {
                autoprefixer: false,
                modules: settings.cssModules,
                importLoaders: true,
                // "context" and "localIdentName" need to be the same with client config,
                // or the style will flick when page first loaded
                context: settings.srcDir,
                localIdentName: LOCAL_IDENT,
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
        },
        // Sass
        {
          test: /\.scss$/,
          exclude: getExcludes(settings),
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 2,
                localIdentName: LOCAL_IDENT,
                sourceMap: true,
                modules: false,
                context: settings.srcDir,
              },
            },
            { loader: 'postcss-loader', options: { sourceMap: true } },
            {
              loader: 'sass-loader',
              options: {
                outputStyle: 'expanded',
                sourceMap: true,
                sourceMapContents: false,
              },
            },
          ],
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
          exclude: getExcludes(settings),
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
          exclude: getExcludes(settings),
          options: {
            emitFile: false,
          },
        },
      ]),
    },
  };
};
