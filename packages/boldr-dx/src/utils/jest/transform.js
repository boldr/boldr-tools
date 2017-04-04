/* @flow */
const babelJest = require('babel-jest');

module.exports = babelJest.createTransformer({
  presets: [require.resolve('babel-preset-boldr/server')],
  plugins: [
    require.resolve('babel-plugin-dynamic-import-webpack'),
  ],
  babelrc: false,
});
