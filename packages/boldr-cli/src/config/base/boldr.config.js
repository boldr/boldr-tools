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
  hasServer: true,
  reactHotLoader: true,
  debug: false,
  vendorFiles: vendor,
};
