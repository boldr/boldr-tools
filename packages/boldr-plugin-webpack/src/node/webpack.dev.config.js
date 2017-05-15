/* @flow */
import path from 'path';
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import CircularDependencyPlugin from 'circular-dependency-plugin';
import WatchMissingNodeModulesPlugin
  from 'react-dev-utils/WatchMissingNodeModulesPlugin';

import defineVariables from '../utils/defineVariables';
import ServerListenerPlugin from '../plugins/ServerListenerPlugin';
import getExcludes from '../utils/getExcludes';
import {
  NODE_OPTS,
  LOCAL_IDENT,
  BUNDLE_EXTENSIONS,
  NODE_MAIN,
} from '../utils/constants';

const PATHS = require('../utils/paths');

const prefetches = [];

const prefetchPlugins = prefetches.map(
  specifier => new webpack.PrefetchPlugin(specifier),
);
const DEV_SERVER_PORT = parseInt(process.env.DEV_SERVER_PORT, 10) || 3001;

module.exports = function createConfig(
  engine: Engine,
  logger: LogGroup,
): Object {
  const {
    env: envVariables,
    settings,
  }: ServerWebpackPluginConfiguration = engine.getConfiguration();

  const serverSettings = settings.bundle.server;
  // $FlowIssue : Not really an issue.
  let plugins: () => any[] = [];
  let decorateLoaders: (loaders: Array<any>) => any = loaders => loaders;
  let whitelistedExternals = [];

  const pluginsInstatiators =
    serverSettings.webpackPlugins && serverSettings.webpackPlugins.development;

  if (Array.isArray(pluginsInstatiators)) {
    plugins = pluginsInstatiators;
  }

  const loadersDecorator =
    serverSettings.webpack &&
    serverSettings.webpack.loadersDecorator &&
    serverSettings.webpack.loadersDecorator.development;

  if (typeof loadersDecorator === 'function') {
    decorateLoaders = loadersDecorator;
  }

  const externalsWhitelist =
    serverSettings.webpack &&
    serverSettings.webpack.externalsWhitelist &&
    serverSettings.webpack.externalsWhitelist.development;

  if (Array.isArray(externalsWhitelist)) {
    whitelistedExternals = externalsWhitelist;
  }

  const VARIABLES_TO_INLINE = {
    'process.env': defineVariables(envVariables, { IS_SERVER: true }),
  };

  return {
    target: 'node',
    context: process.cwd(),
    entry: [serverSettings.entry],
    devtool: 'eval',
    bail: false,
    profile: false,
    node: { console: true, __filename: true, __dirname: true, fs: true },
    externals: [
      nodeExternals({
        whitelist: [
          'webpack/hot/poll?300',
          /\.(eot|woff|woff2|ttf|otf)$/,
          /\.(svg|png|jpg|jpeg|gif|ico)$/,
          /\.(mp4|mp3|ogg|swf|webp)$/,
          /\.(css|scss)$/,
          ...whitelistedExternals,
        ],
      }),
    ],
    output: {
      path: serverSettings.bundleDir,
      pathinfo: true,
      filename: 'server.js',
      publicPath: `http://localhost:${DEV_SERVER_PORT}${settings.webPath}`,
      libraryTarget: 'commonjs2',
    },
    resolve: {
      modules: ['node_modules', PATHS.projectNodeModules].concat(
        PATHS.nodePaths,
      ),
      extensions: BUNDLE_EXTENSIONS,
      descriptionFiles: ['package.json'],
      mainFields: NODE_MAIN,
    },
    // resolve loaders from this plugin directory
    resolveLoader: {
      modules: [PATHS.boldrNodeModules, PATHS.projectNodeModules],
    },
    plugins: [
      ...prefetchPlugins,

      new webpack.LoaderOptionsPlugin({
        minimize: false,
        debug: true,
      }),
      // Each key passed into DefinePlugin AND/OR EnvironmentPlugin is an identifier.
      // @NOTE EnvironmentPlugin allows you to skip writing process.env for each
      // definition. It is the same thing as DefinePlugin.
      //
      // The values for each key will be inlined into the code replacing any
      // instances of the keys that are found.
      // If the value is a string it will be used as a code fragment.
      // If the value isn’t a string, it will be stringified
      new webpack.DefinePlugin(VARIABLES_TO_INLINE),
      // Errors during development will kill any of our NodeJS processes.
      // this prevents that from happening.
      new webpack.NoEmitOnErrorsPlugin(),

      new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),

      // case sensitive paths
      new CaseSensitivePathsPlugin(),

      // watch missing node modules
      new WatchMissingNodeModulesPlugin(settings.projectNodeModules),

      // Custom plugins
      ...plugins.map(pluginInstantiator =>
        pluginInstantiator(engine.getConfiguration(), VARIABLES_TO_INLINE),
      ),

      new ServerListenerPlugin(engine, logger),
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
              loader: 'cache-loader',
              options: {
                // provide a cache directory where cache items should be stored
                cacheDirectory: path.resolve(
                  PATHS.projectNodeModules,
                  '.cache',
                ),
              },
            },
            {
              loader: 'babel-loader',
              options: {
                babelrc: false,
                compact: true,
                sourceMaps: true,
                comments: false,
                cacheDirectory: true,
                presets: [
                  settings.babelrc ||
                    require.resolve('babel-preset-boldr/node'),
                ],
              },
            },
          ],
        },

        // CSS
        {
          test: /\.(css|scss)$/,
          use: [
            {
              loader: 'css-loader/locals',
              options: {
                modules: settings.cssModules,
                // "context" and "localIdentName" need to be the same with client config,
                // or the style will flick when page first loaded
                context: settings.srcDir,
                localIdentName: LOCAL_IDENT,
              },
            },
            'postcss-loader',
            'sass-loader',
          ],
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
            name: '[name].[ext]',
            emitFile: false,
          },
        },
      ]),
    },
  };
};
