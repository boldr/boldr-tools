/* eslint-disable max-lines, prefer-template */

import path from 'path';
import { createHash } from 'crypto';
import _debug from 'debug';
import chalk from 'chalk';

import removeNil from 'boldr-utils/es/arrays/removeNil';
import ifElse from 'boldr-utils/es/logic/ifElse';
import mergeDeep from 'boldr-utils/es/objects/mergeDeep';
import filterEmpty from 'boldr-utils/es/objects/filterEmpty';
import appRoot from 'boldr-utils/es/node/appRoot';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import BabiliPlugin from 'babili-webpack-plugin';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import AssetsPlugin from 'assets-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import ChunkManifestPlugin from 'chunk-manifest-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import StatsPlugin from 'stats-webpack-plugin';
import CircularDependencyPlugin from 'circular-dependency-plugin';

import happyPackPlugin from './plugins/happyPackPlugin';
import LoggerPlugin from './plugins/LoggerPlugin';

const PATHS = require('../../config/paths');

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
        `${require.resolve('webpack-hot-middleware/client')}?path=http://localhost:${BOLDR__DEV_PORT}/__webpack_hmr&timeout=3000`,
        require.resolve('./polyfills/browser'),
        ifDev(require.resolve('react-error-overlay')),
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
      // only dev
      pathinfo: _DEV,
      libraryTarget: 'var',
      strictModuleExceptionHandling: true,
      devtoolModuleFilenameTemplate: info =>
        path.resolve(info.absoluteResourcePath),
    },

    // true if prod
    bail: _PROD,
    // cache dev
    cache: cache[`client-${mode}`],
    // true if prod & enabled in settings
    profile: _PROD && bundle.wpProfile,
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
      mainFields: ['web', 'browser', 'style', 'module', 'jsnext:main', 'main'],
      descriptionFiles: ['package.json'],
      alias: {
        'babel-runtime': path.dirname(
          require.resolve('babel-runtime/package.json'),
        ),
        '~scenes': PATHS.scenesDir,
        '~state': PATHS.stateDir,
        '~admin': PATHS.adminDir,
        '~blog': PATHS.blogDir,
        '~components': PATHS.componentsDir,
        '~core': PATHS.coreDir,
        '~templates': PATHS.tmplDir,
      },
    },
    resolveLoader: {
      modules: [PATHS.boldrNodeModules, PATHS.projectNodeModules],
    },
    module: {
      noParse: [/\.min\.js/],
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
                cacheDirectory: PATHS.cacheDir,
              },
            }),
            'happypack/loader?id=hp-js',
          ]),
        },
        // css
        {
          test: /\.css$/,
          exclude: EXCLUDES,
          use: _DEV
            ? [
                { loader: 'style-loader' },
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
                    config: require.resolve('../../config/postcss.config.js'),
                  },
                },
              ]
            : ExtractTextPlugin.extract({
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
                      config: require.resolve('../../config/postcss.config.js'),
                    },
                  },
                ],
              }),
        },
        // scss
        {
          test: /\.scss$/,
          exclude: EXCLUDES,
          use: _DEV
            ? [
                { loader: 'style-loader' },
                {
                  loader: 'css-loader',
                  options: {
                    importLoaders: 2,
                    localIdentName: LOCAL_IDENT,
                    sourceMap: false,
                    modules: false,
                    context: bundle.srcDir,
                  },
                },
                { loader: 'postcss-loader' },
                {
                  loader: 'fast-sass-loader',
                },
              ]
            : ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: [
                  {
                    loader: 'css-loader',
                    options: {
                      importLoaders: 2,
                      localIdentName: '[hash:base64:5]',
                      context: bundle.srcDir,
                      sourceMap: false,
                      modules: false,
                    },
                  },
                  { loader: 'postcss-loader' },
                  {
                    loader: 'fast-sass-loader',
                  },
                ],
              }),
        },

        // json
        {
          test: /\.json$/,
          loader: 'json-loader',
        },
        {
          test: /\.graphqls/,
          use: 'raw-loader',
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
      new webpack.LoaderOptionsPlugin({
        minimize: _PROD,
        debug: _DEV,
        context: CWD,
      }),
      new AssetsPlugin({
        filename: 'assets.json',
        path: bundle.assetsDir,
        prettyPrint: true,
      }),
      new ProgressBarPlugin({
        format: `${chalk.cyan.bold('Boldr')} status [:bar] ${chalk.magenta(':percent')} (:elapsed seconds)`,
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
      new webpack.EnvironmentPlugin({
        NODE_ENV: JSON.stringify(mode),
      }),
      new webpack.DefinePlugin({
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
      happyPackPlugin({
        name: 'hp-js',
        loaders: [
          {
            path: 'babel-loader',
            query: {
              babelrc: false,
              compact: true,
              sourceMaps: true,
              comments: false,
              cacheDirectory: _DEV,
              presets: [require.resolve('babel-preset-boldr/browser')],
              plugins: removeNil([
                ifDev(require.resolve('react-hot-loader/babel')),
                [
                  require.resolve('babel-plugin-styled-components'),
                  {
                    ssr: true,
                  },
                ],
                [
                  require.resolve('./util/loadableBabel.js'),
                  {
                    server: true,
                    webpack: true,
                  },
                ],
              ]),
            },
          },
        ],
      }),
      ifDev(new webpack.NamedModulesPlugin()),
      ifProd(
        new StatsPlugin('stats.json', {
          chunkModules: true,
          exclude: [/node_modules[\\/]react/],
        }),
      ),
      ifProd(new webpack.HashedModuleIdsPlugin()),
      ifProd(
        new webpack.optimize.CommonsChunkPlugin({
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
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      ifProd(
        new webpack.optimize.CommonsChunkPlugin({
          name: 'common',
          minChunks: Infinity,
        }),
      ),
      ifProd(
        new webpack.optimize.CommonsChunkPlugin({
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
      ifProd(new webpack.optimize.AggressiveMergingPlugin()),
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
      ifDev(new webpack.NoEmitOnErrorsPlugin()),
      //  We need this plugin to enable hot module reloading
      ifDev(new webpack.HotModuleReplacementPlugin()),
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
    browserConfig.plugins.push(
      new webpack.DllReferencePlugin({
        manifest: require(path.resolve(
          bundle.assetsDir,
          '__vendor_dlls__.json',
        )),
      }),
    );
  }
  return browserConfig;
}
