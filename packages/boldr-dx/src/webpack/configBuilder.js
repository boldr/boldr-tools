/* eslint-disable max-lines */
import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import BabiliPlugin from 'babili-webpack-plugin';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import AssetsPlugin from 'assets-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import ChunkManifestPlugin from 'chunk-manifest-webpack-plugin';
import WebpackMd5Hash from 'webpack-md5-hash';
import nodeExternals from 'webpack-node-externals';
import HardSourceWebpackPlugin from 'hard-source-webpack-plugin';
import NamedModulesPlugin from 'webpack/lib/NamedModulesPlugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import WatchMissingNodeModulesPlugin
  from 'react-dev-utils/WatchMissingNodeModulesPlugin';
import CircularDependencyPlugin from 'circular-dependency-plugin';
import _debug from 'debug';
import postCssImport from 'postcss-import';
import autoprefixer from 'autoprefixer';
import discardComments from 'postcss-discard-comments';
import reporter from 'postcss-reporter';
import chalk from 'chalk';
import {
  ifIsFile,
  removeNil,
  ifElse,
  merge,
  mergeDeep,
  filterEmpty,
} from 'boldr-utils';
import defineVariables from '../utils/defineVariables';
import {
  NODE_OPTS,
  LOCAL_IDENT,
  BUNDLE_EXTENSIONS,
  BROWSER_MAIN,
  NODE_NODE_OPTS,
  NODE_MAIN,
} from '../utils/constants';
import LoggerPlugin from './plugins/LoggerPlugin';
import ServerListenerPlugin from './plugins/ServerListenerPlugin';

const PATHS = require('../config/paths');

const debug = _debug('boldr:dx:configBuilder');

const CWD = process.cwd();
const prefetches = [];

const prefetchPlugins = prefetches.map(
  specifier => new webpack.PrefetchPlugin(specifier),
);
const cache = {
  'web-production': {},
  'web-development': {},
  'node-production': {},
  'node-development': {},
};
// This is the Webpack configuration factory. It's the juice!
module.exports = function configBuilder(config, mode, target) {
  debug('MODE: ', mode, 'TARGET: ', target);
  const { inline: envVariables, bundle } = config;
  process.env.NODE_ENV = bundle.debug ? 'development' : mode;
  process.env.BABEL_ENV = mode;
  const _DEV = mode === 'development';
  const _PROD = mode === 'production';
  const _WEB = target === 'web';
  const _NODE = target === 'node';

  const ifDev = ifElse(_DEV);
  const ifProd = ifElse(_PROD);
  const ifWeb = ifElse(_WEB);
  const ifNode = ifElse(_NODE);
  const ifNodeDev = ifElse(_DEV && _NODE);
  const ifDevWeb = ifElse(_DEV && _WEB);
  const ifProdWeb = ifElse(_PROD && _WEB);
  const ifProdNode = ifElse(_PROD && _NODE);

  const BOLDR__DEV_PORT = parseInt(process.env.BOLDR__DEV_PORT, 10) || 3001;
  const EXCLUDES = [
    /node_modules/,
    bundle.client.bundleDir,
    bundle.server.bundleDir,
  ];

  let whitelistedExternals = [];
  const externalsWhitelist =
    bundle.server.webpack &&
    bundle.server.webpack.externalsWhitelist &&
    bundle.server.webpack.externalsWhitelist.development;

  if (Array.isArray(externalsWhitelist)) {
    whitelistedExternals = externalsWhitelist;
  }

  return {
    // pass either node or web
    target,
    // user's project root
    context: process.cwd(),
    // sourcemap
    devtool: _DEV ? 'cheap-module-eval-source-map' : 'source-map',
    entry: filterEmpty({
      app: removeNil([
        ifDevWeb(
          `${require.resolve('webpack-dev-server/client')}?http://localhost:${BOLDR__DEV_PORT}`,
        ),
        ifDevWeb(require.resolve('webpack/hot/only-dev-server')),
        _WEB ? bundle.client.entry : bundle.server.entry,
      ]),
      vendor: ifProdWeb(bundle.vendor),
    }),
    output: {
      path: ifWeb(bundle.client.bundleDir, bundle.server.bundleDir),
      filename: '[name].js',
      chunkFilename: '[name]-[chunkhash].js',
      publicPath: ifDev(
        `http://localhost:${BOLDR__DEV_PORT}${bundle.webPath}`,
        // Otherwise we expect our bundled output to be served from this path.
        bundle.webPath,
      ),
      // only prod
      pathinfo: _DEV,
      libraryTarget: ifNode('commonjs2', 'var'),
    },
    // true if prod
    bail: _PROD,
    // cache dev
    cache: cache[`${target}-${mode}`],
    // true if prod & enabled in settings
    profile: _PROD && bundle.wpProfile,
    node: _NODE ? NODE_NODE_OPTS : NODE_OPTS,
    performance: _WEB && _PROD
      ? {
          hints: 'warning',
        }
      : false,
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
      extensions: ['.js', '.json', '.jsx', '.css', '.scss'],
      modules: ['node_modules', PATHS.projectNodeModules].concat(
        PATHS.nodePaths,
      ),
      mainFields: ifNode(NODE_MAIN, BROWSER_MAIN),
    },
    resolveLoader: {
      modules: [PATHS.boldrNodeModules, PATHS.projectNodeModules],
    },
    externals: removeNil([
      ifNode(() =>
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
      ),
    ]),
    module: {
      noParse: [/\.min\.js/],
      strictExportPresence: true,
      rules: removeNil([
        { parser: { requireEnsure: false } },
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
                cacheDirectory: _DEV,
                presets: removeNil([
                  ifWeb(require.resolve('babel-preset-boldr/browser')),
                  ifNode(require.resolve('babel-preset-boldr/node')),
                ]),
                plugins: removeNil([
                  ifWeb([
                    require.resolve('../utils/loadableBabel.js'),
                    {
                      server: true,
                      webpack: true,
                    },
                  ]),
                ]),
              },
            },
          ]),
        },
        //css
        ifElse(_WEB || _NODE)(
          mergeDeep(
            { test: /\.css$/, exclude: EXCLUDES },
            ifDevWeb({
              loaders: [
                'style-loader',
                {
                  loader: 'css-loader',
                  options: {
                    autoprefixer: false,
                    modules: bundle.cssModules,
                    importLoaders: true,
                    // "context" and "localIdentName" need to be the same with client config,
                    // or the style will flick when page first loaded
                    context: bundle.srcDir,
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
            }),
            ifProdWeb(() => ({
              loader: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: [
                  {
                    loader: 'css-loader',
                    options: {
                      modules: bundle.cssModules,
                      minimize: false,
                      autoprefixer: false,
                      importLoaders: 1,
                      // "context" and "localIdentName" need to be the same with client config,
                      // or the style will flick when page first loaded
                      context: bundle.srcDir,
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
            })),
            ifNode({
              loaders: ['css-loader/locals', 'postcss-loader'], // eslint-disable-line
            }),
          ),
        ),
        // scss
        ifElse(_WEB || _NODE)(
          mergeDeep(
            { test: /\.scss$/, exclude: EXCLUDES },
            ifDevWeb({
              loaders: [
                'style-loader',
                {
                  loader: 'css-loader',
                  options: {
                    importLoaders: 2,
                    localIdentName: LOCAL_IDENT,
                    sourceMap: true,
                    modules: false,
                    context: bundle.srcDir,
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
            }),
            ifProdWeb(() => ({
              loader: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: [
                  {
                    loader: 'css-loader',
                    options: {
                      importLoaders: 2,
                      localIdentName: '[hash:base64:5]',
                      context: bundle.srcDir,
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
            })),
            ifNode({
              loaders: ['css-loader/locals', 'postcss-loader', 'sass-loader'], // eslint-disable-line
            }),
          ),
        ),
        // json
        {
          test: /\.json$/,
          loader: 'json-loader',
        },
        // url
        {
          test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
          loader: 'url-loader',
          exclude: EXCLUDES,
          options: { limit: 10000, emitFile: !_NODE },
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
            emitFile: !_NODE,
          },
        },
      ]),
    },
    plugins: removeNil([
      ...prefetchPlugins,

      ifWeb(
        new AssetsPlugin({
          filename: 'assets.json',
          path: bundle.assetsDir,
          prettyPrint: true,
        }),
      ),
      new ProgressBarPlugin({
        format: `${chalk.cyan.bold('Boldr')} compiling [:bar] ${chalk.magenta(':percent')} (:elapsed seconds)`,
        clear: false,
        summary: true,
      }),
      new webpack.LoaderOptionsPlugin({
        minimize: _PROD,
        debug: !_PROD,
        context: '/',
      }),
      ifDev(
        new HardSourceWebpackPlugin({
          cacheDirectory: path.resolve(
            CWD,
            'node_modules/.cache/.hardsource',
            `${target}-${mode}`,
          ),
          recordsPath: path.resolve(
            CWD,
            'node_modules/.cache/.hardsource',
            `${target}-${mode}`,
            'records.json',
          ),
          environmentHash: {
            CWD,
            directories: ['node_modules'],
            files: ['package.json', 'yarn.lock', '.boldrrc'],
          },
        }),
      ),
      ifDevWeb(new NamedModulesPlugin()),

      // Each key passed into DefinePlugin AND/OR EnvironmentPlugin is an identifier.
      // @NOTE EnvironmentPlugin allows you to skip writing process.env for each
      // definition. It is the same thing as DefinePlugin.
      //
      // The values for each key will be inlined into the code replacing any
      // instances of the keys that are found.
      // If the value is a string it will be used as a code fragment.
      // If the value isn’t a string, it will be stringified
      new webpack.EnvironmentPlugin({
        NODE_ENV: JSON.stringify(mode),
        DEBUG: JSON.stringify(process.env.DEBUG || false),
      }),
      new webpack.DefinePlugin({
        __IS_DEV__: JSON.stringify(_DEV),
        __IS_SERVER__: JSON.stringify(_NODE),
        __IS_CLIENT__: JSON.stringify(_WEB),
        __CHUNK_MANIFEST__: JSON.stringify(
          path.join(bundle.assetsDir || '', 'manifest.json'),
        ),
        __ASSETS_MANIFEST__: JSON.stringify(
          path.join(bundle.assetsDir || '', 'assets.json'),
        ),
      }),
      ifProdWeb(new webpack.HashedModuleIdsPlugin()),
      ifProdWeb(new WebpackMd5Hash()),
      ifProdWeb(
        new webpack.optimize.CommonsChunkPlugin({
          name: 'vendor',
          minChunks: module => /node_modules/.test(module.resource),
        }),
      ),
      ifProdWeb(
        new webpack.optimize.CommonsChunkPlugin({
          name: 'common',
          minChunks: Infinity,
        }),
      ),
      ifProdWeb(
        new webpack.optimize.CommonsChunkPlugin({
          async: true,
          children: true,
          minChunks: 4,
        }),
      ),
      ifProdWeb(new BabiliPlugin({}, { comments: false })),
      ifProdWeb(
        new ExtractTextPlugin({
          filename: '[name]-[contenthash:8].css',
          allChunks: true,
          ignoreOrder: bundle.cssModules,
        }),
      ),
      ifNode(new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })),
      ifProdWeb(
        new ChunkManifestPlugin({
          filename: 'manifest.json',
          manifestVariable: 'CHUNK_MANIFEST',
        }),
      ),
      ifProdWeb(new webpack.optimize.AggressiveMergingPlugin()),
      // case sensitive paths
      ifDev(new CaseSensitivePathsPlugin()),
      ifDevWeb(
        new CircularDependencyPlugin({
          exclude: /a\.js|node_modules/,
          // show a warning when there is a circular dependency
          failOnError: false,
        }),
      ),
      ifDev(
        new LoggerPlugin({
          verbose: bundle.verbose,
          target,
        }),
      ),
      // Errors during development will kill any of our NodeJS processes.
      // this prevents that from happening.
      ifDevWeb(new webpack.NoEmitOnErrorsPlugin()),
      //  We need this plugin to enable hot module reloading
      ifDevWeb(new webpack.HotModuleReplacementPlugin()),
      ifProd(
        new BundleAnalyzerPlugin({
          openAnalyzer: false,
          analyzerMode: 'static',
          logLevel: 'error',
        }),
      ),
      // watch missing node modules
      ifDev(new WatchMissingNodeModulesPlugin(PATHS.projectNodeModules)),
      ifNodeDev(new ServerListenerPlugin(config, target)),
    ]),
  };
};
