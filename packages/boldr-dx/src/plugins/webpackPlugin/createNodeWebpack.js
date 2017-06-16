/* eslint-disable max-lines, prefer-template */
import path from 'path';
import fs from 'fs';
import _debug from 'debug';
import webpack from 'webpack';
import removeNil from 'boldr-utils/lib/arrays/removeNil';
import ifElse from 'boldr-utils/lib/logic/ifElse';
import appRoot from 'boldr-utils/lib/node/appRoot';
import nodeExternals from 'webpack-node-externals';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import CircularDependencyPlugin from 'circular-dependency-plugin';
import nodeObjectHash from 'node-object-hash';
import PATHS from '../../config/paths';
import LoggerPlugin from './plugins/LoggerPlugin';

const debug = _debug('boldr:dx:webpack:createNodeWebpack');
const CWD = fs.realpathSync(process.cwd());

const prefetches = [
  path.resolve(PATHS.srcDir, 'server/ssr/assets.js'),
  path.resolve(PATHS.srcDir, 'server/ssr/CreateHtml.js'),
  path.resolve(PATHS.srcDir, 'shared/App.js'),
];

const prefetchPlugins = prefetches.map(specifier => new webpack.PrefetchPlugin(specifier));
const cache = {
  'server-production': {},
  'server-development': {},
};

// This is the Webpack configuration for Node
export default function createNodeWebpack({ config, mode = 'development', name = 'server' } = {}) {
  debug('MODE: ', mode);

  const { env: envVariables, bundle } = config;
  process.env.BABEL_ENV = mode;

  const _DEV = mode === 'development';
  const _PROD = mode === 'production';
  const _DEBUG = envVariables.BOLDR_DEBUG === '1';
  const ifDev = ifElse(_DEV);
  const ifProd = ifElse(_PROD);
  const ifNodeDeubg = ifElse(_DEBUG);

  const BOLDR_DEV_PORT = parseInt(envVariables.BOLDR_DEV_PORT, 10) || 3001;
  const EXCLUDES = [/node_modules/, bundle.client.bundleDir, bundle.server.bundleDir];

  const nodeConfig = {
    // pass either node or web
    target: 'node',
    // user's project root
    context: CWD,
    // sourcemap
    devtool: '#source-map',
    entry: [require.resolve('./polyfills/node.js'), bundle.server.entry],
    output: {
      path: bundle.server.bundleDir,
      filename: 'server.js',
      sourcePrefix: '  ',
      publicPath: ifDev(
        `http://localhost:${BOLDR_DEV_PORT}`,
        // Otherwise we expect our bundled output to be served from this path.
        bundle.webPath,
      ),
      // only prod
      pathinfo: _DEV,
      libraryTarget: 'commonjs2',
      devtoolModuleFilenameTemplate: info => path.resolve(info.absoluteResourcePath),
    },
    // true if prod
    bail: _PROD,
    // cache dev
    cache: cache[`server-${mode}`],
    // true if prod & enabled in settings
    profile: _PROD && bundle.wpProfile,
    node: {
      console: true,
      __filename: true,
      __dirname: true,
      fs: true,
    },
    performance: false,
    resolve: {
      extensions: ['.js', '.json', '.jsx'],
      modules: ['node_modules', PATHS.srcDir, PATHS.projectNodeModules].concat(
        // It is guaranteed to exist because we tweak it in `env.js`
        process.env.NODE_PATH.split(path.delimiter).filter(Boolean),
      ),
      mainFields: ['module', 'jsnext:main', 'main'],
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
    externals: nodeExternals({
      whitelist: [
        require.resolve('source-map-support/register'),
        /\.(eot|woff|woff2|ttf|otf)$/,
        /\.(svg|png|jpg|jpeg|gif|ico)$/,
        /\.(mp4|mp3|ogg|swf|webp)$/,
        /\.(css|scss)$/,
      ],
      modulesDir: PATHS.projectNodeModules,
    }),
    module: {
      noParse: [/\.min\.js/],
      rules: [
        // js
        {
          test: /\.js$/,
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
              options: {
                babelrc: false,
                compact: true,
                sourceMaps: true,
                comments: false,
                cacheDirectory: _DEV,
                presets: [
                  [
                    require.resolve('babel-preset-boldr/node'),
                    {
                      debug: false,
                      useBuiltins: true,
                      modules: false,
                      targets: {
                        node: 8,
                      },
                      exclude: ['transform-regenerator', 'transform-async-to-generator'],
                    },
                  ],
                ],
                plugins: [
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
                ],
              },
            },
          ]),
        },
        {
          test: /\.css$/,
          exclude: EXCLUDES,
          use: [
            {
              loader: require.resolve('css-loader/locals'),
              options: {
                importLoaders: 1,
              },
            },
            { loader: require.resolve('postcss-loader') },
          ],
        },
        // scss
        {
          test: /\.scss$/,
          exclude: EXCLUDES,
          use: [
            {
              loader: require.resolve('css-loader/locals'),
              options: {
                importLoaders: 1,
              },
            },
            { loader: require.resolve('postcss-loader') },
            { loader: require.resolve('sass-loader') },
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
          loader: require.resolve('url-loader'),
          exclude: EXCLUDES,
          options: { limit: 10000, emitFile: false },
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
            emitFile: false,
          },
        },
      ],
    },
    plugins: removeNil([
      ...prefetchPlugins,
      new webpack.LoaderOptionsPlugin({
        minimize: _PROD,
        debug: !!_DEV,
        context: CWD,
      }),
      new webpack.NormalModuleReplacementPlugin(/^any-promise$/, 'bluebird'),
      new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),

      new webpack.EnvironmentPlugin({
        NODE_ENV: JSON.stringify(mode),
      }),
      // new webpack.IgnorePlugin(/any-promise/),
      new webpack.DefinePlugin({
        __IS_DEV__: JSON.stringify(_DEV),
        __IS_SERVER__: JSON.stringify(true),
        __IS_CLIENT__: JSON.stringify(false),
        __CHUNK_MANIFEST__: JSON.stringify(
          path.join(bundle.assetsDir || '', 'chunk-manifest.json'),
        ),
        __ASSETS_MANIFEST__: JSON.stringify(
          path.join(bundle.assetsDir || '', 'assets-manifest.json'),
        ),
      }),
      new LoggerPlugin({
        verbose: bundle.verbose,
        target: 'node',
      }),
    ]),
  };

  if (_DEV) {
    nodeConfig.stats = 'none';
    nodeConfig.watch = true;
    nodeConfig.plugins.push(
      new CaseSensitivePathsPlugin(),
      new CircularDependencyPlugin({
        exclude: /a\.js|node_modules/,
        // show a warning when there is a circular dependency
        failOnError: false,
      }),
    );
  }
  return nodeConfig;
}
