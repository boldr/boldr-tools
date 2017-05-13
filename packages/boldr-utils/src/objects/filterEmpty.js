/**
 * Remove an object with empty keys
 * @param  {Object} obj the object
 * @return {Object}     the new object without missing keys
 */
function removeEmptyKeys(obj) {
  const copy = {};
  for (const key in obj) {
    // eslint-disable-next-line eqeqeq
    if (!(obj[key] == null || obj[key].length === 0)) {
      copy[key] = obj[key];
    }
  }

  return copy;
}
