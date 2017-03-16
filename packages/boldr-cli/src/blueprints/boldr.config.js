/**
 * The Boldr configuration. Modify values here and we'll do the rest.
 * @type {Object}
 */
const vendor = [
  'react',
  'react-dom',
  'react-router-dom',
  'redux',
  'react-redux',
  'redux-thunk',
];
module.exports = {
  serveAssetsFrom: '/assets/',
  serverPort: process.env.SERVER_PORT || 3000,
  serverHost: process.env.SERVER_HOST || 'localhost',
  hmrPort: process.env.HMR_PORT || 3001,
  isVerbose: true,
  isDebug: false,
  vendorFiles: vendor,
};
