# boldr-plugin-webpack

Webpack configurations, and runner. Combine with `boldr-dx` for an easy universal rendering
React application.


## Usage
Install `boldr-dx` and `boldr-plugin-webpack` as development dependencies for your project.

```
yarn add --dev boldr-dx boldr-plugin-webpack
```

Create the config with `mkdir .boldr && touch .boldr/boldr.js`.

Insert the following into the boldr.js file you created.
```javascript
const path = require('path');

module.exports = {
  env: {
    // everything here will be passed directly to webpack build
    // using DefinePlugin
    BUNDLE_ASSETS_FILENAME: 'assets.json',
    BUNDLE_ASSETS_PATH: path.resolve(__dirname, '../public/assets'),
    ASSETS_MANIFEST_PATH: path.resolve(__dirname, '../public/assets/assets.json'),
    ASSETS_DIR: path.resolve(__dirname, '../public/assets'),
    PUBLIC_DIR: path.resolve(__dirname, '../public'),
    SERVER_PORT: 3000,
    DEV_SERVER_PORT: 3001,
  },
  plugins: [require('boldr-plugin-webpack')],
  settings: {
    client: {
      entry: path.resolve(__dirname, '../src/client/index.js'),
      bundleDir: path.resolve(__dirname, '../public/assets'),
      webpackPlugins: {
        development: [
          /* (configuration: Configuration, variables: Object) => typeof WebpackPlugin */
        ],
        production: [],
      },
    },
    server: {
      entry: path.resolve(__dirname, '../src/server/index.js'),
      bundleDir: path.resolve(__dirname, '../server'),
      webpackPlugins: {
        development: [],
        production: [],
      },
    },
      vendor:  [
        'react',
        'react-dom',
      ]
  },
};
```

Add the commands to your `package.json`.

```json
  "scripts": {
    "build": "NODE_ENV=production boldr-dx build",
    "start": "NODE_ENV=production node server/server.js",
    "dev": "NODE_ENV=development boldr-dx dev",
    "test": "NODE_ENV=test boldr-dx test"
  }
```
