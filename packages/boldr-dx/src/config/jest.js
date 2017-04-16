const path = require('path');
const pathExists = require('path-exists');

const resolveFromUtils = file =>
path.resolve(__dirname, '..', 'utils', 'jest', file);

const ROOT = process.cwd();
const setupTestsFile = pathExists.sync(path.resolve(ROOT, './.boldr/jestSetup.js')) // eslint-disable-line
  ? path.resolve(ROOT, './.boldr/jestSetup.js')
  : undefined;

const coverageDir = path.resolve(ROOT, 'coverage');

module.exports = (rootDir, aliases = {}) => ({
  moduleFileExtensions: ['jsx', 'js', 'json'],
  moduleNameMapper: Object.assign(
    {
      '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': // eslint-disable-line
          resolveFromUtils('file.stub'),
      '^[./a-zA-Z0-9!&$_-]+\\.(css|scss)$': 'identity-obj-proxy',
    },
    aliases,
  ),
  transform: { '.*': resolveFromUtils('transform') },
  setupFiles: [resolveFromUtils('setupJest')],
  setupTestFrameworkScriptFile: setupTestsFile,
  testPathIgnorePatterns: ['./(build|docs|node_modules|images)/'],
  testEnvironment: 'jsdom',
  testRegex: '\\.test.js$',
  collectCoverage: true,
  coverageDirectory: `${coverageDir}`,
  coverageReporters: ['json'],
  coveragePathIgnorePatterns: [
    './(flow-typed|build|docs|boldrCMS|.happypack|bin|.idea|public|db|images|styles)/', // eslint-disable-line
    '/node_modules/',
  ],
  rootDir,
});
