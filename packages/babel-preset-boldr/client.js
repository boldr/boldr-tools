const path = require('path');
const env = process.env.BABEL_ENV || process.env.NODE_ENV;

module.exports = {
  compact: false,
  presets: [
    [require.resolve('babel-preset-env'), {
      modules: false,
      debug: false,
    }],
    require.resolve('babel-preset-react'),
  ],
  plugins: [
    require.resolve('babel-plugin-syntax-dynamic-import'),
    // class { handleClick = () => { } }
    [require.resolve('babel-plugin-transform-class-properties'), {
      spec: true,
    }],
    require.resolve('babel-plugin-transform-decorators-legacy'),
    // { ...param, completed: true }
    require.resolve('babel-plugin-transform-object-rest-spread', {
      useBuiltIns: true,
    }),
    // Transforms JSX - Added so object-rest-spread in JSX uses builtIn
    [require.resolve('babel-plugin-transform-react-jsx'), {
      useBuiltIns: true,
    }],
    require.resolve('babel-plugin-syntax-trailing-function-commas'),
    require.resolve('babel-plugin-transform-unicode-property-regex'),
    [
        require.resolve('babel-plugin-transform-runtime'),
        {
          helpers: false,
          polyfill: false,
          regenerator: true,
          // Resolve the Babel runtime relative to the config.
          moduleName: path.dirname(require.resolve('babel-runtime/package')),
        },
      ],
      [
        require.resolve('babel-plugin-transform-regenerator'),
        {
          // Async functions are converted to generators by babel-preset-env
          async: false,
        },
      ],


  ],
};

if (env === 'production') {
  const prodPlugins = [
    require.resolve('babel-plugin-transform-react-constant-elements'),
    require.resolve('babel-plugin-transform-react-inline-elements'),
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
