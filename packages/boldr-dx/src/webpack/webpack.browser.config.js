/* eslint-disable max-lines */

import path from 'path';
import _debug from 'debug';
import chalk from 'chalk';

import removeNil from 'boldr-utils/es/arrays/removeNil';
import ifElse from 'boldr-utils/es/logic/ifElse';
import mergeDeep from 'boldr-utils/es/objects/mergeDeep';
import filterEmpty from 'boldr-utils/es/objects/filterEmpty';
import appRoot from 'boldr-utils/es/node/appRoot';

import AggressiveMergingPlugin
  from 'webpack/lib/optimize/AggressiveMergingPlugin';
import CommonsChunkPlugin from 'webpack/lib/optimize/CommonsChunkPlugin';
import PrefetchPlugin from 'webpack/lib/PrefetchPlugin';
import LoaderOptionsPlugin from 'webpack/lib/LoaderOptionsPlugin';
import DefinePlugin from 'webpack/lib/DefinePlugin';
import EnvironmentPlugin from 'webpack/lib/EnvironmentPlugin';
import DllReferencePlugin from 'webpack/lib/DllReferencePlugin';
import HashedModuleIdsPlugin from 'webpack/lib/HashedModuleIdsPlugin';
import HotModuleReplacementPlugin from 'webpack/lib/HotModuleReplacementPlugin';
import NoEmitOnErrorsPlugin from 'webpack/lib/NoEmitOnErrorsPlugin';
import NamedModulesPlugin from 'webpack/lib/NamedModulesPlugin';

import ExtractTextPlugin from 'extract-text-webpack-plugin';
import BabiliPlugin from 'babili-webpack-plugin';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import AssetsPlugin from 'assets-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import ChunkManifestPlugin from 'chunk-manifest-webpack-plugin';
import WebpackMd5Hash from 'webpack-md5-hash';
import HardSourceWebpackPlugin from 'hard-source-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import StatsPlugin from 'stats-webpack-plugin';
import CircularDependencyPlugin from 'circular-dependency-plugin';

import LoggerPlugin from './plugins/LoggerPlugin';

const PATHS = require('../config/paths');

const debug = _debug('boldr:dx:webpack:createBrowserWebpack');

const LOCAL_IDENT = '[name]__[local]___[hash:base64:5]';
const CWD = appRoot.get();
const prefetches = [];

const prefetchPlugins = prefetches.map(
  specifier => new webpack.PrefetchPlugin(specifier),
);

const cache = {
  'client-production': {},
  'client-development': {},
};

// This is the Webpack configuration factory. It's the juice!
export default function createBrowserWebpack(
  { config, mode = 'development', name = 'client' } = {},
) {
  debug('MODE: ', mode);
  const { env: envVariables, bundle } = config;

  process.env.BABEL_ENV = mode;

  const _DEV = mode === 'development';
  const _PROD = mode === 'production';

  const ifDev = ifElse(_DEV);
  const ifProd = ifElse(_PROD);

  const BOLDR__DEV_PORT = parseInt(envVariables.BOLDR__DEV_PORT, 10) || 3001;
  const EXCLUDES = [
    /node_modules/,
    bundle.client.bundleDir,
    bundle.server.bundleDir,
    bundle.publicDir,
  ];

  const browserConfig = {
    // pass either node or web
    target: 'web',
    // user's project root
    context: appRoot.get(),
    // sourcemap
    devtool: _DEV ? 'cheap-eval-source-map' : 'source-map',
    entry: filterEmpty({
      app: removeNil([
        ifDev(require.resolve('react-hot-loader/patch')),
        `${require.resolve('webpack-dev-server/client')}?http://localhost:${BOLDR__DEV_PORT}`,
        require.resolve('webpack/hot/dev-server'),
        require.resolve('./polyfills/browser'),
        bundle.client.entry,
      ]),
      vendor: ifProd(bundle.vendor),
    }),
    output: {
      path: bundle.client.bundleDir,
      filename: _DEV ? '[name].js' : '[name]-[chunkhash].js',
      chunkFilename: _DEV ? '[name]-[hash].js' : '[name]-[chunkhash].js',
      publicPath: ifDev(
        `http://localhost:${BOLDR__DEV_PORT}/`,
        // Otherwise we expect our bundled output to be served from this path.
        bundle.webPath,
      ),
      // only prod
      pathinfo: _DEV,
      libraryTarget: 'var',
    },

    // true if prod
    bail: _PROD,
    // cache dev
    cache: cache[`client-${mode}`],
    // true if prod & enabled in settings
    profile: bundle.wpProfile,
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      console: true,
      __filename: true,
      __dirname: true,
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
      mainFields: ['web', 'browser', 'style', 'module', 'jsnext:main', 'main'],
      descriptionFiles: ['package.json'],
    },
    resolveLoader: {
      modules: [PATHS.boldrNodeModules, PATHS.projectNodeModules],
    },
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
                presets: [require.resolve('babel-preset-boldr/browser')],
                plugins: removeNil([
                  ifDev(require.resolve('react-hot-loader/babel')),
                  [
                    require.resolve('../utils/loadableBabel.js'),
                    {
                      server: true,
                      webpack: true,
                    },
                  ],
                ]),
              },
            },
          ]),
        },
        //css
        mergeDeep(
          { test: /\.css$/, exclude: EXCLUDES },
          ifDev({
            loaders: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  autoprefixer: false,
                  modules: bundle.cssModules,
                  minimize: false,
                  discardComments: { removeAll: true },
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
                  config: require.resolve('../config/postcss.config.js'),
                },
              },
            ],
          }),
          ifProd(() => ({
            loader: ExtractTextPlugin.extract({
              fallback: 'style-loader',
              use: [
                {
                  loader: 'css-loader',
                  options: {
                    modules: bundle.cssModules,
                    minimize: true,
                    autoprefixer: false,
                    discardComments: { removeAll: true },
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
                    config: require.resolve('../config/postcss.config.js'),
                  },
                },
              ],
            }),
          })),
        ),
        // scss
        mergeDeep(
          { test: /\.scss$/, exclude: EXCLUDES },
          ifDev({
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
          ifProd(() => ({
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
        ),
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
          options: { limit: 10000, emitFile: true },
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
            emitFile: true,
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
      new AssetsPlugin({
        filename: 'assets.json',
        path: bundle.assetsDir,
        prettyPrint: true,
      }),
      new ProgressBarPlugin({
        format: `${chalk.cyan.bold('Boldr')} client status [:bar] ${chalk.magenta(':percent')} (:elapsed seconds)`,
        clear: false,
        summary: true,
      }),
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
        __IS_SERVER__: JSON.stringify(false),
        __IS_CLIENT__: JSON.stringify(true),
        __CHUNK_MANIFEST__: JSON.stringify(
          path.join(bundle.assetsDir || '', 'manifest.json'),
        ),
        __ASSETS_MANIFEST__: JSON.stringify(
          path.join(bundle.assetsDir || '', 'assets.json'),
        ),
      }),
      ifDev(
        new HardSourceWebpackPlugin({
          cacheDirectory: path.resolve(
            CWD,
            'node_modules/.cache/.hardsource',
            `client-${mode}`,
          ),
          recordsPath: path.resolve(
            CWD,
            'node_modules/.cache/.hardsource',
            `client-${mode}`,
            'records.json',
          ),
          configHash: config => require('node-object-hash')().hash(config),
        }),
      ),
      ifDev(new NamedModulesPlugin()),
      new PrefetchPlugin(`${bundle.srcDir}/shared/components/App/App.js`),
      ifProd(
        new StatsPlugin('stats.json', {
          chunkModules: true,
          exclude: [/node_modules[\\/]react/],
        }),
      ),
      ifProd(new HashedModuleIdsPlugin()),
      new WebpackMd5Hash(),
      ifProd(
        new CommonsChunkPlugin({
          name: 'vendor',
          minChunks(module) {
            // A module is extracted into the vendor chunk when...
            return (
              // If it's inside node_modules
              /node_modules/.test(module.context) &&
              // Do not externalize if the request is a CSS file
              !/\.(css|less|scss|sass|styl|stylus)$/.test(module.request)
            );
          },
        }),
      ),
      ifProd(
        new CommonsChunkPlugin({
          name: 'common',
          minChunks: Infinity,
        }),
      ),
      ifProd(
        new CommonsChunkPlugin({
          async: true,
          children: true,
          minChunks: 4,
        }),
      ),
      ifProd(new BabiliPlugin({}, { comments: false })),
      ifProd(
        new ExtractTextPlugin({
          filename: '[name]-[contenthash:8].css',
          allChunks: true,
          ignoreOrder: bundle.cssModules,
        }),
      ),

      ifProd(
        new ChunkManifestPlugin({
          filename: 'manifest.json',
          manifestVariable: 'CHUNK_MANIFEST',
        }),
      ),
      ifProd(new AggressiveMergingPlugin()),
      // case sensitive paths
      ifDev(new CaseSensitivePathsPlugin()),
      ifDev(
        new CircularDependencyPlugin({
          exclude: /a\.js|node_modules/,
          // show a warning when there is a circular dependency
          failOnError: false,
        }),
      ),
      ifDev(
        new LoggerPlugin({
          verbose: bundle.verbose,
          target: 'web',
        }),
      ),
      // Errors during development will kill any of our NodeJS processes.
      // this prevents that from happening.
      ifDev(new NoEmitOnErrorsPlugin()),
      //  We need this plugin to enable hot module reloading
      ifDev(new HotModuleReplacementPlugin()),
      ifProd(
        new BundleAnalyzerPlugin({
          openAnalyzer: false,
          analyzerMode: 'static',
          logLevel: 'error',
        }),
      ),
    ]),
  };
  if (_DEV) {
    browserConfig.devServer = {
      disableHostCheck: true,
      clientLogLevel: 'none',
      // Enable gzip compression of generated files.
      compress: true,
      // watchContentBase: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      historyApiFallback: {
        // Paths with dots should still use the history fallback.
        // See https://github.com/facebookincubator/create-react-app/issues/387.
        disableDotRule: true,
      },
      hot: true,
      noInfo: true,
      overlay: false,
      port: 3001,
      host: 'localhost',
      quiet: true,
      // Reportedly, this avoids CPU overload on some systems.
      // https://github.com/facebookincubator/create-react-app/issues/293
      watchOptions: {
        ignored: /node_modules/,
      },
    };
    browserConfig.plugins.push(
      new DllReferencePlugin({
        manifest: require(path.resolve(
          bundle.assetsDir,
          '__vendor_dlls__.json',
        )),
      }),
    );
  }
  return browserConfig;
}
