import path from 'path';
import webpack from 'webpack';
import shell from 'shelljs';
import chalk from 'chalk';
import { removeNil, mergeDeep, ifElse } from 'boldr-utils';
import paths from '../paths';
import getPostCSSConfig from '../postCSSconfig';

module.exports = options => {
  const isDev = options.environment === 'development';
  const isProd = options.environment === 'production';
  const isClient = options.type === 'client';
  const isServer = options.type === 'server';
  const isNode = !isClient;
  const ifDev = ifElse(isDev);
  const ifProd = ifElse(isProd);
  const ifNode = ifElse(isNode);

  const cache = {
    'client-production': {},
    'client-development': {},
    'server-production': {},
    'server-development': {},
  };

  return {
    devtool: 'source-map',

    resolve: {
      extensions: ['.js', '.json', '.jsx', '.css', '.scss'],
      modules: [paths.USER_NODE_MODULES, paths.OUR_NODE_MODULES, paths.SRC_DIR],
      mainFields: ifNode(['module', 'jsnext:main', 'main'], [
        'web',
        'browser',
        'style',
        'module',
        'jsnext:main',
        'main',
      ]),
    },
    resolveLoader: {
      modules: [paths.USER_NODE_MODULES, paths.OUR_NODE_MODULES, paths.SRC_DIR],
    },
    cache: cache[`${options.type}-${options.environment}`],
    // Capture timing information for each module.
    // Analyse tool: http://webpack.github.io/analyse
    profile: isProd,

    // Report the first error as a hard error instead of tolerating it.
    bail: isProd,
    stats: {
      colors: true,
      reasons: options.isDebug,
      hash: options.isVerbose,
      version: options.isVerbose,
      timings: true,
      chunks: options.isVerbose,
      chunkModules: options.isVerbose,
      cached: options.isVerbose,
      cachedAssets: options.isVerbose,
    },
    plugins: removeNil([
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || options.environment),
        PUBLIC_PATH: JSON.stringify(options.publicPath || ''),
        PUBLIC_DIR: JSON.stringify(options.publicDir || ''),
        ASSETS_MANIFEST: JSON.stringify(path.join(paths.ASSETS_DIR || '', options.clientAssetsFile || '')),
      }),
      new webpack.optimize.OccurrenceOrderPlugin(true),
      ifDev(
        new webpack.LoaderOptionsPlugin({
          minimize: false,
          debug: true,
          options: {
            eslint: {
              failOnError: false,
            },
            postcss: getPostCSSConfig({}),
            context: paths.ROOT_DIR,
          },
        }),
      ),
      ifProd(
        new webpack.LoaderOptionsPlugin({
          minimize: true,
          debug: false,
          options: {
            eslint: {
              failOnError: false,
            },
            postcss: getPostCSSConfig({}),
            context: paths.ROOT_DIR,
          },
        }),
      ),
    ]),

    module: {
      rules: removeNil([
        {
          parser: {
            requireEnsure: false,
          },
        },
        {
          test: /\.(js|jsx)$/,
          enforce: 'pre',
          use: [
            {
              options: {
                configFile: path.join(paths.ROOT_DIR, './.eslintrc'),
                useEslintrc: false,
              },
              loader: 'eslint-loader',
            },
          ],
          include: paths.SRC_DIR,
        },
        {
          test: /\.html$/,
          loader: 'file-loader?name=[name].[ext]',
        },
        {
          test: /\.(eot|svg|ttf|woff2?)(\?v=\d+\.\d+\.\d+)?$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 8096,
              name: 'fonts/[name].[ext]',
            },
          },
        },
        {
          test: /\.(gif|jpe?g|png)/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 2000,
              name: 'img/[name].[ext]',
            },
          },
        },
      ]),
    },
  };
};
