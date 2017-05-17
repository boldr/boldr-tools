/**
 * Test whether an object could be a promise.
 * @param {any} obj
 * @returns {bool}
 */
export default function isPromise(obj) {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  );
}
