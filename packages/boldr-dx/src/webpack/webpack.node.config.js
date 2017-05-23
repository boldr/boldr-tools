/* eslint-disable max-lines */

import path from 'path';
import _debug from 'debug';
import chalk from 'chalk';
import removeNil from 'boldr-utils/es/arrays/removeNil';
import ifElse from 'boldr-utils/es/logic/ifElse';
import appRoot from 'boldr-utils/es/node/appRoot';

import LimitChunkCountPlugin from 'webpack/lib/optimize/LimitChunkCountPlugin';
import LoaderOptionsPlugin from 'webpack/lib/LoaderOptionsPlugin';
import DefinePlugin from 'webpack/lib/DefinePlugin';
import EnvironmentPlugin from 'webpack/lib/EnvironmentPlugin';
import HotModuleReplacementPlugin from 'webpack/lib/HotModuleReplacementPlugin';
import NoEmitOnErrorsPlugin from 'webpack/lib/NoEmitOnErrorsPlugin';

import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import nodeExternals from 'webpack-node-externals';
import WriteFilePlugin from 'write-file-webpack-plugin';
import HardSourceWebpackPlugin from 'hard-source-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import CircularDependencyPlugin from 'circular-dependency-plugin';

import LoggerPlugin from './plugins/LoggerPlugin';
import ServerListenerPlugin from './plugins/ServerListenerPlugin';

const PATHS = require('../config/paths');

const debug = _debug('boldr:dx:webpack:createNodeWebpack');

const CWD = appRoot.get();
const prefetches = [];

const prefetchPlugins = prefetches.map(
  specifier => new webpack.PrefetchPlugin(specifier),
);
const cache = {
  'server-production': {},
  'server-development': {},
};

// This is the Webpack configuration for Node
export default function createNodeWebpack(
  { config, mode = 'development', name = 'server' } = {},
) {
  debug('MODE: ', mode);
  const { env: envVariables, bundle } = config;
  process.env.BABEL_ENV = mode;

  const _DEV = mode === 'development';
  const _PROD = mode === 'production';
  const _DEBUG = envVariables.BOLDR__DEBUG === '1';
  const ifDev = ifElse(_DEV);
  const ifProd = ifElse(_PROD);
  const ifNodeDeubg = ifElse(_DEBUG);

  const BOLDR__DEV_PORT = parseInt(envVariables.BOLDR__DEV_PORT, 10) || 3001;
  const EXCLUDES = [
    /node_modules/,
    bundle.client.bundleDir,
    bundle.server.bundleDir,
    bundle.publicDir,
  ];

  return {
    // pass either node or web
    target: 'async-node',
    // user's project root
    context: appRoot.get(),
    // sourcemap
    devtool: 'source-map',
    entry: removeNil([
      ifDev('webpack/hot/poll?300'),
      require.resolve('./polyfills/node'),
      bundle.server.entry,
    ]),
    output: {
      path: bundle.server.bundleDir,
      filename: 'server.js',
      publicPath: ifDev(
        `http://localhost:${BOLDR__DEV_PORT}${bundle.webPath}`,
        // Otherwise we expect our bundled output to be served from this path.
        bundle.webPath,
      ),
      // only prod
      pathinfo: _DEV,
      libraryTarget: 'commonjs2',
    },
    // true if prod
    bail: _PROD,
    watch: true,
    // cache dev
    cache: cache[`server-${mode}`],
    // true if prod & enabled in settings
    profile: bundle.wpProfile,
    node: {
      console: true,
      __filename: true,
      __dirname: true,
      fs: true,
    },
    performance: false,
    stats: {
      colors: true,
      reasons: bundle.debug,
      hash: bundle.verbose,
      version: bundle.verbose,
      timings: true,
      chunks: bundle.verbose,
      chunkModules: bundle.verbose,
      cached: bundle.verbose,
      cachedAssets: bundle.verbose,
    },
    resolve: {
      extensions: ['.js', '.json', '.jsx'],
      modules: ['node_modules', PATHS.projectNodeModules].concat(
        PATHS.nodePaths,
      ),
      unsafeCache: true,
      mainFields: ['module', 'jsnext:main', 'main'],
      alias: {
        'webpack/hot/poll': require.resolve('webpack/hot/poll'),
      },
    },
    resolveLoader: {
      modules: [PATHS.boldrNodeModules, PATHS.projectNodeModules],
    },
    externals: nodeExternals({
      whitelist: [
        'source-map-support/register',
        _DEV ? 'webpack/hot/poll?300' : null,
        /\.(eot|woff|woff2|ttf|otf)$/,
        /\.(svg|png|jpg|jpeg|gif|ico)$/,
        /\.(mp4|mp3|ogg|swf|webp)$/,
        /\.(css|scss)$/,
      ],
    }),
    module: {
      noParse: [/\.min\.js/],
      strictExportPresence: true,
      rules: removeNil([
        // js
        {
          test: /\.(js|jsx)$/,
          include: bundle.srcDir,
          exclude: EXCLUDES,
          use: removeNil([
            ifDev({
              loader: 'cache-loader',
              options: {
                // provide a cache directory where cache items should be stored
                cacheDirectory: path.resolve(
                  PATHS.projectNodeModules,
                  '.cache',
                ),
              },
            }),
            {
              loader: 'babel-loader',
              options: {
                babelrc: false,
                compact: true,
                sourceMaps: true,
                comments: false,
                cacheDirectory: !!_DEV,
                presets: [require.resolve('babel-preset-boldr/node')],
                plugins: [],
              },
            },
          ]),
        },
        {
          test: /\.css$/,
          exclude: EXCLUDES,
          use: ['css-loader/locals', 'postcss-loader'],
        },
        // scss
        {
          test: /\.scss$/,
          exclude: EXCLUDES,
          use: ['css-loader/locals', 'postcss-loader', 'sass-loader'],
        },
        // json
        {
          test: /\.json$/,
          loader: 'json-loader',
        },
        {
          test: /\.(graphql|gql)$/,
          exclude: EXCLUDES,
          loader: require.resolve('graphql-tag/loader'),
        },
        // url
        {
          test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
          loader: 'url-loader',
          exclude: EXCLUDES,
          options: { limit: 10000, emitFile: false },
        },
        {
          test: /\.svg(\?v=\d+.\d+.\d+)?$/,
          exclude: EXCLUDES,
          loader: 'url-loader?limit=10000&mimetype=image/svg+xml&name=[name].[ext]', // eslint-disable-line
        },
        // file
        {
          test: /\.(ico|eot|ttf|otf|mp4|mp3|ogg|pdf|html)$/, // eslint-disable-line
          loader: 'file-loader',
          exclude: EXCLUDES,
          options: {
            emitFile: false,
          },
        },
      ]),
    },
    plugins: removeNil([
      ...prefetchPlugins,
      new LoaderOptionsPlugin({
        minimize: _PROD,
        debug: !!_DEV,
        context: CWD,
      }),
      new ProgressBarPlugin({
        format: `${chalk.cyan.bold('Boldr')} server status [:bar] ${chalk.magenta(':percent')} (:elapsed seconds)`,
        clear: false,
        summary: true,
      }),
      new LimitChunkCountPlugin({ maxChunks: 1 }),

      ifDev(new WriteFilePlugin({ log: false })),
      ifDev(
        new HardSourceWebpackPlugin({
          cacheDirectory: path.resolve(
            CWD,
            'node_modules/.cache/.hardsource',
            `server-${mode}`,
          ),
          recordsPath: path.resolve(
            CWD,
            'node_modules/.cache/.hardsource',
            `server-${mode}`,
            'records.json',
          ),
          configHash: config => require('node-object-hash')().hash(config),
        }),
      ),

      // Each key passed into DefinePlugin AND/OR EnvironmentPlugin is an identifier.
      // @NOTE EnvironmentPlugin allows you to skip writing process.env for each
      // definition. It is the same thing as DefinePlugin.
      //
      // The values for each key will be inlined into the code replacing any
      // instances of the keys that are found.
      // If the value is a string it will be used as a code fragment.
      // If the value isn’t a string, it will be stringified
      new EnvironmentPlugin({
        NODE_ENV: JSON.stringify(mode),
      }),
      new DefinePlugin({
        __IS_DEV__: JSON.stringify(_DEV),
        __IS_SERVER__: JSON.stringify(true),
        __IS_CLIENT__: JSON.stringify(false),
        __CHUNK_MANIFEST__: JSON.stringify(
          path.join(bundle.assetsDir || '', 'manifest.json'),
        ),
        __ASSETS_MANIFEST__: JSON.stringify(
          path.join(bundle.assetsDir || '', 'assets.json'),
        ),
      }),
      // case sensitive paths
      ifDev(new CaseSensitivePathsPlugin()),

      ifDev(
        new LoggerPlugin({
          verbose: bundle.verbose,
          target: 'server',
        }),
      ),
      ifDev(
        new CircularDependencyPlugin({
          exclude: /a\.js|node_modules/,
          // show a warning when there is a circular dependency
          failOnError: false,
        }),
      ),
      ifDev(new HotModuleReplacementPlugin()),
      // Errors during development will kill any of our NodeJS processes.
      // this prevents that from happening.
      ifDev(new NoEmitOnErrorsPlugin()),
      ifDev(
        new ServerListenerPlugin({
          name: 'server.js',
          nodeArgs: removeNil([
            ifNodeDeubg('--inspect'),
            ifNodeDeubg('--trace-warnings'),
          ]),
        }),
      ),
    ]),
  };
}
