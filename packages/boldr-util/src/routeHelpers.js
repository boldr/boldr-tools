/**
 * Loads a route.
 *
 * @method loadRoute
 * @param  {Function} cb [description]
 * @return {[type]}      [description]
 */
const loadRoute = (cb) => (componentModule) => {
  cb(null, componentModule.default);
};
/**
 * Error loading the view.
 *
 * @method errorLoading
 */
const errorLoading = (err) => {
  console.error('Dynamic page loading failed', err); // eslint-disable-line no-console
};

export {
  loadRoute,
  errorLoading,
};
