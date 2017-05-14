/* @flow */
import requiredParam from 'boldr-utils/es/logic/requiredParam';

export const CHUNK_MANIFEST_PATH: string = requiredParam(
  process.env.CHUNK_MANIFEST_PATH,
);
export const ASSETS_PATH: string = requiredParam(process.env.ASSETS_PATH);
export const ASSETS_DIR: string = requiredParam(process.env.ASSETS_DIR);
export const IS_DEVELOPMENT: boolean =
  requiredParam(process.env.NODE_ENV) === 'development';

export const PUBLIC_DIR: string = requiredParam(process.env.PUBLIC_DIR);
