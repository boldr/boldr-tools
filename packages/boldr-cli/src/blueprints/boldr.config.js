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
  serverPort: 3000,
  serverHost: 'localhost',
  hmrPort: 3001,
  isVerbose: true,
  isDebug: false,
  vendorFiles: vendor,
};
