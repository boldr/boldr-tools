const path = require('path');

const env = process.env.BABEL_ENV || process.env.NODE_ENV;

module.exports = {
  presets: [
    [
      require.resolve('babel-preset-env'),
      {
        modules: false,
        debug: false,
        useBuiltIns: true,
        targets: {
          browsers: ['>1%', 'last 2 versions', 'safari >= 9'],
        },
      },
    ],
    require.resolve('babel-preset-react'),
  ],
  plugins: [
    require.resolve('babel-plugin-syntax-flow'),
    require.resolve('babel-plugin-syntax-dynamic-import'),
    // class { handleClick = () => { } }
    [
      require.resolve('babel-plugin-transform-class-properties'),
      {
        spec: true,
      },
    ],
    require.resolve('babel-plugin-transform-decorators-legacy'),
    // { ...param, completed: true }
    [
      require.resolve('babel-plugin-transform-object-rest-spread'),
      {
        useBuiltIns: true,
      },
    ],
    [
      require.resolve('babel-plugin-transform-regenerator'),
      {
        // Async functions are converted to generators by babel-preset-env
        async: false,
      },
    ],
    // Transforms JSX - Added so object-rest-spread in JSX uses builtIn
    [
      require.resolve('babel-plugin-transform-react-jsx'),
      {
        useBuiltIns: true,
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
  ],
};

if (env === 'production') {
  const prodPlugins = [
    [
      require.resolve('babel-plugin-transform-react-remove-prop-types'),
      { removeImport: true },
    ],
    require.resolve('babel-plugin-transform-react-constant-elements'),
    require.resolve('babel-plugin-transform-react-inline-elements'),
    require.resolve('babel-plugin-transform-flow-strip-types'),
  ];

  module.exports.plugins.push(...prodPlugins);
}

if (env === 'development' || env === 'test') {
  const devPlugins = [
    // Adds component stack to warning messages
    require.resolve('babel-plugin-transform-react-jsx-source'),
    // Adds __self attribute to JSX which React will use for some warnings
    require.resolve('babel-plugin-transform-react-jsx-self'),
  ];

  module.exports.plugins.push(...devPlugins);
}
