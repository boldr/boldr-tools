/* @flow */

function notEmpty(value: ?string): string {
  if (value == null) {
    throw new Error('Has to be nonempty string');
  }

  return value;
}

export const ASSETS_PATH: string = notEmpty(process.env.ASSETS_PATH);
export const ASSETS_DIR: string = notEmpty(process.env.ASSETS_DIR);
export const IS_DEVELOPMENT: boolean = notEmpty(process.env.NODE_ENV) === 'development';
export const PUBLIC_DIR: string = notEmpty(process.env.PUBLIC_DIR);
export const SERVER_PORT: number = parseInt(notEmpty(process.env.SERVER_PORT), 10);

/* @flow */

import fs from 'fs';
import { ASSETS_PATH, IS_DEVELOPMENT } from './config';

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
let loadedAssets = {};

function hasAssets(): boolean {
  return assetsMap.scripts.length > 0 || assetsMap.styles.length > 0;
}

export default function assets(): AssetsMap {
  if (hasAssets() && !IS_DEVELOPMENT) {
    return assetsMap;
  }

  try {
    loadedAssets = JSON.parse(fs.readFileSync(ASSETS_PATH, 'utf8'));
  } catch (e) {
    // do nothing
  }

  const chunks: Chunk[] = Object.keys(loadedAssets).map(key => loadedAssets[key]);
  assetsMap = chunks.reduce(
    (acc: AssetsMap, chunk: Chunk) => {
      if (chunk.js) {
        acc.scripts.push(...chunk.js);
      }

      if (chunk.css) {
        acc.styles.push(...chunk.css);
      }

      return acc;
    },
    { scripts: [], styles: [] }
  );

  return assetsMap;
}
