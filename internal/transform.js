/* @flow */
const babelJest = require('babel-jest');

module.exports = babelJest.createTransformer({
  presets: [require('babel-preset-env')],
  plugins: [require('babel-plugin-transform-object-rest-spread')],
  babelrc: false,
});
