/* eslint-disable babel/new-cap */
import path from 'path';
import os from 'os';

import HappyPack from 'happypack';

import paths from '../../config/paths';

export default function happyPackPlugin(id, loaders) {
  const compilerThreadPool = HappyPack.ThreadPool({
    size: os.cpus().length,
  });
  return new HappyPack({
    id,
    tempDir: paths.happyPackDir,
    verbose: false,
    threadPool: compilerThreadPool,
    loaders,
  });
};
