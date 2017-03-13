const path = require('path');
const postcssImport = require('postcss-import');
const postcssCssnext = require('postcss-cssnext');

function PostCSSConfig(variables = {}) {
  return [
    postcssImport(),
    postcssCssnext({
      overflowWrap: true,
      rem: false,
      colorRgba: false,
      autoprefixer: {
        browsers: ['> 1%', 'last 2 versions'],
      },
    }),
  ];
}
module.exports = PostCSSConfig;
