/* eslint-disable max-lines, prefer-template */

import path from 'path';
import fs from 'fs';
import _debug from 'debug';
import webpack from 'webpack';
import removeNil from 'boldr-utils/lib/arrays/removeNil';
import ifElse from 'boldr-utils/lib/logic/ifElse';
import mergeDeep from 'boldr-utils/lib/objects/mergeDeep';
import filterEmpty from 'boldr-utils/lib/objects/filterEmpty';
import appRoot from 'boldr-utils/lib/node/appRoot';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import AssetsPlugin from 'assets-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import ChunkManifestPlugin from 'chunk-manifest-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import StatsPlugin from 'stats-webpack-plugin';
import CircularDependencyPlugin from 'circular-dependency-plugin';
import nodeObjectHash from 'node-object-hash';

import PATHS from '../../config/paths';
import { postCssConfig } from './util/helpers';
import LoggerPlugin from './plugins/LoggerPlugin';

const debug = _debug('boldr:dx:webpack:createBrowserWebpack');

const LOCAL_IDENT = '[name]__[local]___[hash:base64:5]';
const CWD = fs.realpathSync(process.cwd());

const prefetches = [
  path.resolve(PATHS.scenesDir, 'Blog/ArticleListing/ArticleListingContainer.js'),
  path.resolve(PATHS.scenesDir, 'Admin/AdminDashboard.js'),
  path.resolve(PATHS.srcDir, 'shared/App.js'),
];

const prefetchPlugins = prefetches.map(specifier => new webpack.PrefetchPlugin(specifier));

const cache = {
  'client-production': {},
  'client-development': {},
};

export default function createBrowserWebpack(
  { config, mode = 'development', name = 'client' } = {},
) {
  const { env: envVariables, bundle } = config;

  process.env.BABEL_ENV = mode;

  const _DEV = mode === 'development';
  const _PROD = mode === 'production';

  const ifDev = ifElse(_DEV);
  const ifProd = ifElse(_PROD);

  const BOLDR_DEV_PORT = parseInt(envVariables.BOLDR_DEV_PORT, 10) || 3001;

  const EXCLUDES = [
    /node_modules/,
    bundle.client.bundleDir,
    bundle.server.bundleDir,
    bundle.publicDir,
  ];
  // const testdir = bundle.base.bind(null, config.dir_src)
  const getEntry = () => {
    // For development
    let entry = {
      app: [
        ifDev(require.resolve('react-hot-loader/patch')),
        `${require.resolve(
          'webpack-hot-middleware/client',
        )}?path=http://localhost:${BOLDR_DEV_PORT}/__webpack_hmr&timeout=3000`,
        require.resolve('./polyfills/browser'),
        bundle.client.entry,
      ],
    };
    // For prodcution
    if (!_DEV) {
      entry = {
        app: [require.resolve('./polyfills/browser'), bundle.client.entry],
        // Register vendors here
        vendor: bundle.vendor,
      };
    }

    return entry;
  };
  const browserConfig = {
    // pass either node or web
    target: 'web',
    // user's project root
    context: CWD,
    // sourcemap
    devtool: _DEV ? 'cheap-module-eval-source-map' : 'source-map',
    entry: getEntry(),
    output: {
      path: bundle.client.bundleDir,
      filename: _DEV ? '[name].js' : '[name]-[chunkhash].js',
      chunkFilename: _DEV ? '[name]-[hash].js' : '[name]-[chunkhash].js',
      publicPath: ifDev(
        `http://localhost:${BOLDR_DEV_PORT}/`,
        // Otherwise we expect our bundled output to be served from this path.
        bundle.webPath,
      ),
      // only dev
      pathinfo: _DEV,
      libraryTarget: 'var',
      strictModuleExceptionHandling: true,
      devtoolModuleFilenameTemplate: info => path.resolve(info.absoluteResourcePath),
    },
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
      modules: ['node_modules', PATHS.srcDir, PATHS.projectNodeModules].concat(
        // It is guaranteed to exist because we tweak it in `env.js`
        process.env.NODE_PATH.split(path.delimiter).filter(Boolean),
      ),
      mainFields: ['web', 'browser', 'style', 'module', 'jsnext:main', 'main'],
      descriptionFiles: ['package.json'],
      alias: {
        'babel-runtime': path.dirname(require.resolve('babel-runtime/package.json')),
        '~scenes': path.resolve(bundle.srcDir, 'shared/scenes'),
        '~state': path.resolve(bundle.srcDir, 'shared/state'),
        '~admin': path.resolve(bundle.srcDir, 'shared/scenes/Admin'),
        '~blog': path.resolve(bundle.srcDir, 'shared/scenes/Blog'),
        '~components': path.resolve(bundle.srcDir, 'shared/components'),
        '~core': path.resolve(bundle.srcDir, 'shared/core'),
        '~templates': path.resolve(bundle.srcDir, 'shared/templates'),
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
          // exclude: EXCLUDES,
          use: removeNil([
            ifDev({
              loader: require.resolve('cache-loader'),
              options: {
                // provide a cache directory where cache items should be stored
                cacheDirectory: PATHS.cacheDir,
              },
            }),
            {
              loader: require.resolve('babel-loader'),
              query: {
                babelrc: false,
                compact: true,
                sourceMaps: true,
                comments: false,
                cacheDirectory: _DEV,
                presets: [
                  [
                    require.resolve('babel-preset-boldr/browser'),
                    {
                      useBuiltins: true,
                      modules: false,
                      exclude: ['transform-regenerator', 'transform-async-to-generator'],
                    },
                  ],
                ],
                plugins: removeNil([
                  [
                    require.resolve('babel-plugin-styled-components'),
                    {
                      ssr: true,
                    },
                  ],
                  [
                    require.resolve('babel-plugin-import-inspector'),
                    {
                      serverSideRequirePath: true,
                      webpackRequireWeakId: true,
                    },
                  ],
                ]),
              },
            },
          ]),
        },
        // css
        {
          test: /\.css$/,
          exclude: EXCLUDES,
          use: _DEV
            ? [
                { loader: require.resolve('style-loader') },
                {
                  loader: require.resolve('css-loader'),
                  options: {
                    autoprefixer: false,
                    modules: bundle.cssModules,
                    minimize: false,
                    importLoaders: 1,
                    context: bundle.srcDir,
                    localIdentName: LOCAL_IDENT,
                  },
                },
                {
                  loader: require.resolve('postcss-loader'),
                  options: {
                    // https://webpack.js.org/guides/migrating/#complex-options
                    ident: 'postcss',
                    plugins: () => [
                      require('postcss-flexbugs-fixes'),
                      require('postcss-cssnext')({
                        browsers: ['> 1%', 'last 2 versions'],
                        flexbox: 'no-2009',
                      }),
                    ],
                  },
                },
              ]
            : ExtractTextPlugin.extract({
                fallback: require.resolve('style-loader'),
                use: [
                  {
                    loader: require.resolve('css-loader'),
                    options: {
                      modules: bundle.cssModules,
                      minimize: true,
                      autoprefixer: false,
                      importLoaders: 1,
                      context: bundle.srcDir,
                      localIdentName: '[hash:base64:5]',
                    },
                  },
                  {
                    loader: require.resolve('postcss-loader'),
                    options: {
                      // https://webpack.js.org/guides/migrating/#complex-options
                      ident: 'postcss',
                      plugins: () => [
                        require('postcss-flexbugs-fixes'),
                        require('postcss-cssnext')({
                          browsers: ['> 1%', 'last 2 versions'],
                          flexbox: 'no-2009',
                        }),
                      ],
                    },
                  },
                ],
              }),
        },
        // scss
        {
          test: /\.scss$/,
          include: bundle.srcDir,
          use: _DEV
            ? [
                { loader: require.resolve('style-loader') },
                {
                  loader: require.resolve('css-loader'),
                  options: {
                    importLoaders: 2,
                    localIdentName: LOCAL_IDENT,
                    sourceMap: false,
                    modules: false,
                    context: bundle.srcDir,
                  },
                },
                {
                  loader: require.resolve('postcss-loader'),
                  options: {
                    // https://webpack.js.org/guides/migrating/#complex-options
                    ident: 'postcss',
                    plugins: () => [
                      require('postcss-flexbugs-fixes'),
                      require('postcss-cssnext')({
                        browsers: ['> 1%', 'last 2 versions'],
                        flexbox: 'no-2009',
                      }),
                    ],
                  },
                },
                {
                  loader: require.resolve('sass-loader'),
                },
              ]
            : ExtractTextPlugin.extract({
                fallback: require.resolve('style-loader'),
                use: [
                  {
                    loader: require.resolve('css-loader'),
                    options: {
                      importLoaders: 2,
                      localIdentName: '[hash:base64:5]',
                      context: bundle.srcDir,
                      sourceMap: false,
                      modules: false,
                    },
                  },
                  {
                    loader: require.resolve('postcss-loader'),
                    options: {
                      // https://webpack.js.org/guides/migrating/#complex-options
                      ident: 'postcss',
                      plugins: () => [
                        require('postcss-flexbugs-fixes'),
                        require('postcss-cssnext')({
                          browsers: ['> 1%', 'last 2 versions'],
                          flexbox: 'no-2009',
                        }),
                      ],
                    },
                  },
                  {
                    loader: require.resolve('sass-loader'),
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
          loader: require.resolve('url-loader'),
          exclude: EXCLUDES,
          options: { limit: 10000, emitFile: true },
        },
        {
          test: /\.svg(\?v=\d+.\d+.\d+)?$/,
          exclude: EXCLUDES,
          loader: `${require.resolve(
            'url-loader',
          )}?limit=10000&mimetype=image/svg+xml&name=[name].[ext]`, // eslint-disable-line
        },
        // file
        {
          test: /\.(ico|eot|ttf|otf|mp4|mp3|ogg|pdf|html)$/, // eslint-disable-line
          loader: require.resolve('file-loader'),
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
        debug: !!_DEV,
        context: CWD,
      }),
      // new webpack.IgnorePlugin(/any-promise/),
      new webpack.EnvironmentPlugin({
        NODE_ENV: JSON.stringify(mode),
      }),
      new webpack.NormalModuleReplacementPlugin(/^any-promise$/, 'bluebird'),
      new webpack.DefinePlugin({
        __IS_DEV__: JSON.stringify(_DEV),
        __IS_SERVER__: JSON.stringify(false),
        __IS_CLIENT__: JSON.stringify(true),
        __CHUNK_MANIFEST__: JSON.stringify(
          path.join(bundle.assetsDir || '', 'chunk-manifest.json'),
        ),
        __ASSETS_MANIFEST__: JSON.stringify(
          path.join(bundle.assetsDir || '', 'assets-manifest.json'),
        ),
      }),
      new AssetsPlugin({
        filename: 'assets-manifest.json',
        path: bundle.assetsDir,
        prettyPrint: true,
      }),
    ]),
  };

  if (_DEV) {
    browserConfig.plugins.push(
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
      new CircularDependencyPlugin({
        exclude: /a\.js|node_modules/,
        failOnError: false,
      }),
      new LoggerPlugin({
        verbose: bundle.verbose,
        target: 'web',
      }),
      new CaseSensitivePathsPlugin(),
      new webpack.DllReferencePlugin({
        manifest: require(path.resolve(bundle.assetsDir, '__vendor_dlls__.json')),
      }),
    );
  }
  if (_PROD) {
    browserConfig.plugins.push(
      new webpack.HashedModuleIdsPlugin(),
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
        ignoreOrder: bundle.cssModules,
      }),
      new webpack.optimize.AggressiveMergingPlugin(),
      new StatsPlugin('stats.json', {
        chunkModules: true,
        exclude: [/node_modules[\\/]react/],
      }),
      new ChunkManifestPlugin({
        filename: 'chunk-manifest.json',
        manifestVariable: 'CHUNK_MANIFEST',
      }),
      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        analyzerMode: 'static',
        logLevel: 'error',
      }),
    );
  }
  return browserConfig;
}
