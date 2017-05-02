module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 8,
    impliedStrict: true,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      generators: true,
    },
  },
  plugins: ['babel'],
  extends: [
    './rules/stylistic.js',
    './rules/best-practices.js',
    './rules/possible-errors.js',
    './rules/node.js',
    './rules/es6.js',
  ],
};
