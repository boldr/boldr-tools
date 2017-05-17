const removeNil = require('./removeNil');

function merge() {
  // eslint-disable-next-line prefer-rest-params
  const funcArgs = Array.prototype.slice.call(arguments);

  return Object.assign.apply(null, removeEmpty([{}].concat(funcArgs)));
}

module.exports = merge;
