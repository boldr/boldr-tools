const path = require('path');

const env = process.env.BABEL_ENV || process.env.NODE_ENV;

module.exports = {
  presets: [
    [
      require.resolve('babel-preset-env'),
      {
        debug: false,
        useBuiltIns: true,
        targets: {
          node: 7,
        },
        exclude: ['transform-async-to-generator'],
      },
    ],
    require.resolve('babel-preset-react'),
  ],
  plugins: [
    require.resolve('babel-plugin-syntax-flow'),
    require.resolve('babel-plugin-syntax-dynamic-import'),

    // class { handleClick = () => { } }
    require.resolve('babel-plugin-transform-class-properties'),
    // { ...param, completed: true }
    [
      require.resolve('babel-plugin-transform-object-rest-spread'),
      {
        useBuiltIns: true,
      },
    ],
    require.resolve('babel-plugin-transform-decorators-legacy'),
    [
      require.resolve('babel-plugin-transform-regenerator'),
      {
        // Async functions are converted to generators by babel-preset-env
        async: false,
      },
    ],
    [
      require.resolve('babel-plugin-transform-runtime'),
      {
        helpers: false,
        polyfill: false,
        regenerator: true,
        useESModules: true,
        moduleName: path.dirname(require.resolve('babel-runtime/package')),
      },
    ],
    require.resolve('babel-plugin-dynamic-import-node'),
  ],
};
if (env === 'production') {
  const prodPlugins = [
    require.resolve('babel-plugin-transform-flow-strip-types'),
  ];

  module.exports.plugins.push(...prodPlugins);
}
