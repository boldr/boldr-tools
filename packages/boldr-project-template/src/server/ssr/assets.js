/* @flow */

import fs from 'fs';
import { ABSOLUTE_ASSETSMANIFEST_PATH, IS_DEVELOPMENT } from '../config';

type AssetsMap = {|
  scripts: string[],
  styles: string[]
|};

type Chunk = {
  css: string[],
  js: string[]
};

let assetsMap: AssetsMap = {
  scripts: [],
  styles: [],
};

let resultCache;
export default function assets(): AssetsMap {
    if (!IS_DEVELOPMENT && resultCache) {
    return resultCache;
  }
  if (!fs.existsSync(ABSOLUTE_ASSETSMANIFEST_PATH)) {
    throw new Error(
      `We could not find the "${ABSOLUTE_ASSETSMANIFEST_PATH}" file, which contains a list of the assets of the client bundle.  Please ensure that the client bundle has been built.`,
    );
  }
   const readAssetsJSONFile = () => JSON.parse(fs.readFileSync(ABSOLUTE_ASSETSMANIFEST_PATH, 'utf8'));
    const assetsJSONCache = readAssetsJSONFile();
    resultCache = assetsJSONCache;
    return resultCache;
}
