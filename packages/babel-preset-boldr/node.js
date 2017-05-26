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
        exclude: ['transform-regenerator', 'transform-async-to-generator'],
      },
    ],
    require.resolve('babel-preset-react'),
  ],
  plugins: [
    require.resolve('babel-plugin-syntax-flow'),
    require.resolve('babel-plugin-syntax-dynamic-import'),
    [
      require.resolve('fast-async'),
      {
        spec: true,
      },
    ],

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

    require.resolve('babel-plugin-dynamic-import-node'),
  ],
};
if (env === 'production') {
  const prodPlugins = [
    require.resolve('babel-plugin-transform-flow-strip-types'),
  ];

  module.exports.plugins.push(...prodPlugins);
}
