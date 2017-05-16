/* @flow */
import webpack from 'webpack';

/**
 * Exactly like its name, this function starts webpack, runs it and resolves
 * @param  {Object} webpackConfig webpack configuration
 * @return {Promise}               the buid will finish, or reject
 */
function compileOnce(webpackConfig: Object): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      webpack(webpackConfig, (err, stats) => {
        if (err || stats.hasErrors()) {
          return reject(err);
        }

        return resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}

export default compileOnce;
