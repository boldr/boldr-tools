/* @flow */
import webpack from 'webpack';
import _debug from 'debug';
import logger from 'boldr-utils/es/logger';

const debug = _debug('boldr:dx:webpack:createSingleCompiler');
/**
 * Exactly like its name, this function starts webpack, runs it and resolves
 * @param  {Object} webpackConfig webpack configuration
 * @return {Promise}               the buid will finish, or reject
 */
function createSingleCompiler(webpackConfig: WebpackCompiler): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      webpack(webpackConfig, (err, stats) => {
        if (err || stats.hasErrors()) {
          debug(err);
          return reject(err);
        }

        return resolve();
      });
    } catch (e) {
      return reject(e);
    }
  });
}

export default createSingleCompiler;
