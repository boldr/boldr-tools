/* @flow */
import path from 'path';
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';
import defineVariables from '../utils/defineVariables';

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

module.exports = function createConfig(
  engine: Engine,
  logger: LogGroup,
): Object {
  const {
    inline: envVariables,
    settings,
  }: ServerWebpackPluginConfiguration = engine.getConfiguration();

  const serverSettings = settings.bundle.server;
  // $FlowIssue : Not really an issue.
  let plugins: () => any[] = [];
  let decorateLoaders: (loaders: Array<any>) => any = loaders => loaders;
  let whitelistedExternals = [];

  const pluginsInstatiators =
    serverSettings.webpackPlugins && serverSettings.webpackPlugins.production;

  if (Array.isArray(pluginsInstatiators)) {
    plugins = pluginsInstatiators;
  }

  const loadersDecorator =
    serverSettings.webpack &&
    serverSettings.webpack.loadersDecorator &&
    serverSettings.webpack.loadersDecorator.production;

  if (typeof loadersDecorator === 'function') {
    decorateLoaders = loadersDecorator;
  }

  const externalsWhitelist =
    serverSettings.webpack &&
    serverSettings.webpack.externalsWhitelist &&
    serverSettings.webpack.externalsWhitelist.production;

  if (Array.isArray(externalsWhitelist)) {
    whitelistedExternals = externalsWhitelist;
  }

  const VARIABLES_TO_INLINE = {
    'process.env': defineVariables(envVariables, { IS_SERVER: true }),
  };

  return {
    target: 'node',
    context: process.cwd(),

    entry: serverSettings.entry,
    bail: true,
    profile: settings.wpProfile,
    devtool: 'source-map',
    output: {
      path: serverSettings.bundleDir,
      pathinfo: false,
      filename: 'server.js',
      publicPath: settings.webPath || '/assets/',
      libraryTarget: 'commonjs2',
    },
    resolve: {
      modules: ['node_modules', PATHS.projectNodeModules].concat(
        PATHS.nodePaths,
      ),
      extensions: BUNDLE_EXTENSIONS,
      descriptionFiles: ['package.json'],
      mainFields: NODE_MAIN,
      alias: {
        react: require.resolve('react/dist/react.min.js'),
        'react-dom': require.resolve('react-dom/dist/react-dom.min.js'),
      },
    },
    // resolve loaders from this plugin directory
    resolveLoader: {
      modules: [PATHS.boldrNodeModules, PATHS.projectNodeModules],
    },
    node: { console: true, __filename: true, __dirname: true, fs: true },
    externals: [
      nodeExternals({
        whitelist: [
          /\.(eot|woff|woff2|ttf|otf)$/,
          /\.(svg|png|jpg|jpeg|gif|ico)$/,
          /\.(mp4|mp3|ogg|swf|webp)$/,
          /\.(css|scss|sass|sss|less)$/,
          ...whitelistedExternals,
        ],
      }),
    ],
    plugins: [
      // define global variable
      new webpack.DefinePlugin(VARIABLES_TO_INLINE),

      new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),

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
                    require.resolve('babel-preset-boldr/node'),
                ],
              },
            },
          ],
        },
        // CSS
        {
          test: /\.css$/,
          exclude: getExcludes(settings),
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
        {
          test: /\.scss$/,
          exclude: getExcludes(settings),
          use: [
            {
              loader: 'css-loader/locals',
              options: {
                modules: false,
                // "context" and "localIdentName" need to be the same with client config,
                // or the style will flick when page first loaded
                context: settings.srcDir,
                localIdentName: LOCAL_IDENT,
                importLoaders: 2,
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
          options: { limit: 10000, emitFile: false },
        },
        {
          test: /\.svg(\?v=\d+.\d+.\d+)?$/,
          loader: 'url-loader?limit=10000&mimetype=image/svg+xml&name=[name].[ext]', // eslint-disable-line
          options: {
            emitFile: false,
          },
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
