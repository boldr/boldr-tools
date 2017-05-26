/* eslint-disable babel/new-cap */
const os = require('os');
const path = require('path');
const HappyPack = require('happypack');
const PATHS = require('../../../config/paths');

export default function happyPackPlugin({ name, loaders }) {
  const compilerThreadPool = HappyPack.ThreadPool({
    size: os.cpus().length,
  });
  return new HappyPack({
    id: name,
    verbose: false,
    tempDir: PATHS.cacheDir,
    threadPool: compilerThreadPool,
    loaders,
  });
}
