const removeNil = require('./removeNil');

module.exports = function merge() {
  // eslint-disable-next-line prefer-rest-params
  const funcArgs = Array.prototype.slice.call(arguments);

  return Object.assign.apply(null, removeNil([{}].concat(funcArgs)));
};
