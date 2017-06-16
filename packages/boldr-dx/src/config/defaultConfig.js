const getClientEnvironment = require('./env');

const envDefaults = getClientEnvironment();

module.exports = {
  env: {
    NODE_ENV: envDefaults.raw.NODE_ENV,
    BOLDR_SERVER_PORT: parseInt(envDefaults.raw.BOLDR_SERVER_PORT, 10),
    BOLDR_DEV_PORT: parseInt(envDefaults.raw.BOLDR_DEV_PORT, 10),
  },
  plugins: [require('../plugins/watchConfig'), require('../plugins/webpackPlugin')],
  bundle: {
    cssModules: true,
    wpProfile: false,
    webPath: '/assets/',
    babelrc: null,
  },
};

/*
env: {
  NODE_ENV: process.env.NODE_ENV,
  BOLDR_SERVER_PORT: process.env.BOLDR_SERVER_PORT,
  BOLDR_DEV_PORT: process.env.BOLDR_DEV_PORT,
  BOLDR_DEBUG: process.env.BOLDR_DEBUG,
  BOLDR_GRAPHQL: process.env.BOLDR_GRAPHQL,
},
// plugins: [require('boldr-plugin-webpack')],
bundle: {
  graphlUrl: 'http://localhost:3000/api/v1/graphql',
  verbose: true,
  debug: false,
  cssModules: true,
  wpProfile: false,
  webPath: '/assets/',
  publicDir: path.resolve(__dirname, 'public'),
  assetsDir: path.resolve(__dirname, 'dist/assets'),
  srcDir: path.resolve(__dirname, 'src'),
  client: {
    entry: path.resolve(__dirname, 'src/client/index.js'),
    admin: path.resolve(__dirname, 'src/client/admin.js'),
    bundleDir: path.resolve(__dirname, 'dist/assets'),
  },
  server: {
    entry: path.resolve(__dirname, 'src/server/index.js'),
    bundleDir: path.resolve(__dirname, 'dist'),
  },
  vendor: [
    'apollo-client',
    'axios',
    'boldr-ui',
    'boldr-utils',
    'classnames',
    'date-fns',
    'draft-convert',
    'draft-js',
    'draftjs-utils',
    'graphql-tag',
    'griddle-react',
    'lodash',
    'material-ui',
    'material-ui-icons',
    'prop-types',
    'react',
    'react-apollo',
    'react-dom',
    'react-dropzone',
    'react-helmet',
    'react-redux',
    'react-router-dom',
    'react-router-redux',
    'react-tap-event-plugin',
    'react-transition-group',
    'redux',
    'redux-form',
    'redux-thunk',
    'reselect',
    'serialize-javascript',
    'styled-components',
    'uuid',
    'webfontloader',
  ],
},

 */
