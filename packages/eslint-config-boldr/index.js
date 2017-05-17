module.exports = {
  parser: 'babel-eslint',
  // http://eslint.org/docs/user-guide/configuring#specifying-parser-options
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      impliedStrict: true,
      generators: true,
    },
  },
  // http://eslint.org/docs/user-guide/configuring#specifying-environments
  env: {
    browser: true,
    node: true,
    es6: true,
    'shared-node-browser': true,
    jest: true,
  },
  // http://eslint.org/docs/user-guide/configuring#configuring-plugins
  plugins: ['babel', 'prettier'],
  extends: [
    './rules/stylistic.js',
    './rules/best-practices.js',
    './rules/possible-errors.js',
    './rules/node.js',
    './rules/es6.js',
  ],
};
