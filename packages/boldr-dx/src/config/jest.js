import path from 'path';
import pathExists from 'path-exists';
import paths from './paths';

const { rootDir } = paths;
const resolveFromUtils = file => path.resolve(__dirname, '../utils/jest', file);

const setupTestsFile = pathExists.sync(
  path.resolve(paths.boldrDir, 'jestSetup.js'),
) // eslint-disable-line
  ? path.resolve(paths.boldrDir, 'jestSetup.js')
  : undefined;

const coverageDir = path.resolve(rootDir, 'coverage');

module.exports = (rootDir, aliases = {}) => {
  const config = {
    timers: 'fake',
    moduleFileExtensions: ['jsx', 'js', 'json'],
    moduleNameMapper: Object.assign(
      {
        // eslint-disable-line
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': resolveFromUtils(
          'file.stub',
        ),
        '^[./a-zA-Z0-9!&$_-]+\\.(css|scss)$': 'identity-obj-proxy',
      },
      aliases,
    ),
    transform: { '^.+\\.js$': resolveFromUtils('transform') },
    setupFiles: [path.resolve(paths.boldrDir, 'jestSetup.js')],
    setupTestFrameworkScriptFile: setupTestsFile,
    testPathIgnorePatterns: [
      '/node_modules/',
      '<rootDir>/(tools|lib|docs|.happypack|bin|public)/',
    ],
    testEnvironment: 'jsdom',
    testRegex: '.*.test\\.js',
    collectCoverage: true,
    coverageDirectory: '<rootDir>/coverage',
    coveragePathIgnorePatterns: [
      '<rootDir>/(flow-typed|build|docs|boldrCMS|.happypack|bin|.idea|public|db|images|styles)/', // eslint-disable-line
      '/node_modules/',
      '/__fixtures__/',
    ],
    snapshotSerializers: ['<rootDir>/node_modules/enzyme-to-json/serializer'],
  };
  if (rootDir) {
    config.rootDir = rootDir;
  }
  return config;
};
