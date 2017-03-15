const path = require('path');
const env = process.env.BABEL_ENV || process.env.NODE_ENV;

module.exports = {
  compact: false,
  presets: [
    [
      require.resolve('babel-preset-env'), {
        useBuiltIns: false,
        debug: false,
        targets: {
          node: 'current',
        },
        include: ['transform-es2015-destructuring'],
        exclude: ['transform-async-to-generator', 'transform-regenerator'],
      },
    ],
    require.resolve('babel-preset-react'),
  ],
  plugins: [
    // class { handleClick = () => { } }
    [require.resolve('babel-plugin-transform-class-properties'), {
      spec: true,
    }],
    // { ...param, completed: true }
    require.resolve('babel-plugin-transform-object-rest-spread', {
      useBuiltIns: true,
    }),
    require.resolve('babel-plugin-transform-decorators-legacy'),

    require.resolve('babel-plugin-syntax-dynamic-import'),
    [require.resolve('fast-async'), { spec: true }],
  ],
};

if (env === 'development' || env === 'test') {
  const devPlugins = [
    // Adds component stack to warning messages
    require.resolve('babel-plugin-transform-react-jsx-source'),
    // Adds __self attribute to JSX which React will use for some warnings
    require.resolve('babel-plugin-transform-react-jsx-self'),
  ];

  module.exports.plugins.push(...devPlugins);
}
