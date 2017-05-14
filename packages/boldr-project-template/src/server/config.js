/* @flow */
import { resolve as pathResolve } from 'path';

const ABS_ROOT = process.cwd();

function notEmpty(value: ?string): string {
  if (value == null) {
    throw new Error('Has to be nonempty string');
  }

  return value;
}

export const ASSETS_MANIFEST_PATH: string = notEmpty(process.env.ASSETS_MANIFEST_PATH);
export const ASSETS_DIR: string = notEmpty(process.env.ASSETS_DIR);
export const IS_DEVELOPMENT: boolean = notEmpty(process.env.NODE_ENV) === 'development';
export const PUBLIC_DIR: string = notEmpty(process.env.PUBLIC_DIR);
export const SERVER_PORT: number = parseInt(notEmpty(process.env.SERVER_PORT), 10);
export const BUNDLE_ASSETS_FILENAME = notEmpty(process.env.BUNDLE_ASSETS_FILENAME);
// export const CHUNK_MANIFEST_FILENAME = notEmpty(process.env.CHUNK_MANIFEST_FILENAME);/

export const ABSOLUTE_ASSETSMANIFEST_PATH = pathResolve(
  ABS_ROOT,
  process.env.ASSETS_DIR,
  process.env.BUNDLE_ASSETS_FILENAME,
)
