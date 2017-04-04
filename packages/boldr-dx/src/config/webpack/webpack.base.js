import path from 'path';
import webpack from 'webpack';
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

  return {
    cache: !isProd,
    resolve: {
      modules: [paths.userNodeModules, paths.ourNodeModules, paths.srcDir],
      mainFields: ifNode(
        ['module', 'jsnext:main', 'main'],
        ['web', 'browser', 'style', 'module', 'jsnext:main', 'main'],
      ),
      extensions: ['.js', '.json', '.jsx', '.css', '.scss'],
    },
    resolveLoader: {
      modules: [paths.userNodeModules, paths.ourNodeModules, paths.srcDir],
    },
    node: {
      __dirname: true,
      __filename: true,
      fs: 'empty',
      global: true,
      crypto: 'empty',
      process: true,
      module: false,
      clearImmediate: false,
      setImmediate: false,
    },
    plugins: removeNil([
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || options.environment),
        ASSETS_MANIFEST: JSON.stringify(path.join(paths.assetsDir || '', options.clientAssetsFile || '')),
      }),
      new webpack.optimize.OccurrenceOrderPlugin(true),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new webpack.LoaderOptionsPlugin({
        minimize: isProd,
        debug: !isProd,
        options: {
          eslint: {
            failOnError: false,
          },
          postcss: getPostCSSConfig({}),
          context: paths.rootDir,
        },
      }),
    ]),

    module: {
      rules: [
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
                configFile: path.join(paths.rootDir, './.eslintrc'),
                useEslintrc: true,
              },
              loader: 'eslint-loader',
            },
          ],
          include: paths.srcDir,
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
      ],
    },
  };
};
