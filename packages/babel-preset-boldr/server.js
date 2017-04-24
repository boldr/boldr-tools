const path = require('path');
const env = process.env.BABEL_ENV || process.env.NODE_ENV;

module.exports = {
  compact: false,
  presets: [
    [
      require.resolve('babel-preset-env'), {
      modules: false,
      useBuiltIns: true,
      debug: false,
        targets: {
          node: 'current',
        },
      },
    ],
    require.resolve('babel-preset-react'),
  ],
  plugins: [
    require.resolve('babel-plugin-syntax-flow'),
    require.resolve('babel-plugin-syntax-trailing-function-commas'),
    require.resolve('babel-plugin-syntax-dynamic-import'),
    // class { handleClick = () => { } }
    [require.resolve('babel-plugin-transform-class-properties'), {
      spec: true,
    }],
    // { ...param, completed: true }
    require.resolve('babel-plugin-transform-object-rest-spread', {
      useBuiltIns: true,
    }),
    require.resolve('babel-plugin-transform-decorators-legacy'),
    [
    require.resolve('babel-plugin-transform-runtime'),
    {
      helpers: true,
      polyfill: false,
      regenerator: true,
      // Resolve the Babel runtime relative to the config.
      moduleName: path.dirname(require.resolve('babel-runtime/package')),
    },
  ],
    [require.resolve('babel-plugin-transform-regenerator'), { async: false }],
    require.resolve('babel-plugin-dynamic-import-node'),
  ],
};
if (env === 'production') {
  const prodPlugins = [
    require.resolve('babel-plugin-transform-flow-strip-types'),
  ];

  module.exports.plugins.push(...prodPlugins);
}
