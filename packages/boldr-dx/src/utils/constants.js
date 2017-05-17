export const LOCAL_IDENT = '[name]__[local]___[hash:base64:5]';
export const NODE_OPTS = { console: true, __filename: true, __dirname: true };
export const NODE_NODE_OPTS = {
  console: true,
  __filename: true,
  __dirname: true,
  fs: true,
};
export const BUNDLE_EXTENSIONS = ['.js', '.json', '.jsx', '.css', '.scss'];
export const BROWSER_MAIN = [
  'web',
  'browser',
  'style',
  'module',
  'jsnext:main',
  'main',
];

export const NODE_MAIN = ['module', 'jsnext:main', 'main'];
