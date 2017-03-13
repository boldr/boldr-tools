const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const paths = require('../paths');

module.exports = options => ({
  target: 'node',

  node: {
    __dirname: false,
    __filename: false,
  },

  externals: [
    nodeExternals({
      whitelist: [
        /\.(eot|woff|woff2|ttf|otf)$/,
        /\.(svg|png|jpg|jpeg|gif|ico)$/,
        /\.(mp4|mp3|ogg|swf|webp)$/,
        /\.(css|scss|sass|styl|less)$/,
        'source-map-support/register',
      ],
    }),
  ],

  entry: {
    main: [`${paths.SERVER_SRC_DIR}/index.js`],
  },

  output: {
    path: paths.COMPILED_DIR,
    filename: '[name].js',
    pathinfo: true,
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: options.publicPath,
    libraryTarget: 'commonjs2',
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        exclude: [/node_modules/, paths.COMPILED_DIR],
        options: {
          babelrc: false,
          cacheDirectory: false,
          presets: [require.resolve('babel-preset-boldr/server')],
        },
      },
      {
        test: /\.(scss|css)$/,
        use: [
          {
            loader: 'css-loader/locals',
            options: {
              modules: true,
              minimize: true,
              autoprefixer: false,
              importLoaders: 1,
              localIdentName: '[hash:base64]',
            },
          },
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'sass-loader',
            options: {
              outputStyle: 'expanded',
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: true,
    }),
  ],
});
