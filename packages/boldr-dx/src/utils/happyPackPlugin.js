const path = require('path');
const os = require('os');
const HappyPack = require('happypack');
const paths = require('../config/paths');

module.exports = function happyPackPlugin(id, loaders) {
  const compilerThreadPool = HappyPack.ThreadPool({
    size: os.cpus().length,
  });
  return new HappyPack({
    id,
    tempDir: path.resolve(paths.ROOT_DIR, '.happypack'),
    verbose: false,
    threadPool: compilerThreadPool,
    loaders,
  });
};
