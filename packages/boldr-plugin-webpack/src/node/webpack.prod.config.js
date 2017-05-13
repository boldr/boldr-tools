/* @flow */
import path from 'path';
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';
import defineVariables from '../utils/defineVariables';
import LoggerPlugin from '../plugins/LoggerPlugin';

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
    env: envVariables,
    settings,
  }: ServerWebpackPluginConfiguration = engine.getConfiguration();

  const serverSettings = settings.server;
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

  const inlineVariables = {
    'process.env': defineVariables(envVariables, { IS_SERVER: true }),
  };

  const EXCLUDES = [
    /node_modules/,
    settings.client.bundleDir,
    settings.server.bundleDir,
  ];

  return {
    target: 'node',
    context: process.cwd(),

    entry: settings.server.index,
    bail: true,
    profile: settings.wpProfile,
    devtool: 'source-map',
    output: {
      path: settings.server.bundleDir,
      pathinfo: false,
      filename: 'server.js',
      publicPath: settings.server.publicPath || '/',
      libraryTarget: 'commonjs2',
    },
    resolve: {
      modules: ['node_modules', settings.projectNodeModules].concat(
        PATHS.nodePaths,
      ),
      extensions: ['.js', '.json', '.jsx', '.css', '.scss'],
      descriptionFiles: ['package.json'],
      mainFields: ['module', 'jsnext:main', 'main'],
    },
    // resolve loaders from this plugin directory
    resolveLoader: {
      modules: [PATHS.boldrNodeModules, PATHS.projectNodeModules],
    },
    node: {
      console: true,
      __filename: true,
      __dirname: true,
    },
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
      new webpack.DefinePlugin(inlineVariables),

      new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),

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
          exclude: EXCLUDES,
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
          exclude: EXCLUDES,
          use: [
            {
              loader: 'css-loader/locals',
              options: {
                modules: settings.cssModules,
                // "context" and "localIdentName" need to be the same with client config,
                // or the style will flick when page first loaded
                context: settings.projectSrcDir,
                localIdentName: '[hash:base64:5]',
              },
            },
            'postcss-loader',
            'sass-loader',
          ],
        },
        {
          test: /\.scss$/,
          exclude: EXCLUDES,
          use: [
            {
              loader: 'css-loader/locals',
              options: {
                modules: false,
                // "context" and "localIdentName" need to be the same with client config,
                // or the style will flick when page first loaded
                context: settings.projectSrcDir,
                localIdentName: '[hash:base64:5]',
                importLoaders: 2,
              },
            },
            'postcss-loader',
            'sass-loader',
          ],
        },

        // url
        {
          test: /\.(woff2?|png|jpg|gif|jpeg|ttf|eot|mp4|webm|wav|mp3|m4a|aac|oga)(\?.*)?$/,
          loader: 'url-loader',
          exclude: EXCLUDES,
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
          exclude: EXCLUDES,
          options: {
            name: '[name].[ext]',
            emitFile: false,
          },
        },
      ]),
    },
  };
};
