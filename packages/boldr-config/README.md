# boldr-config

Boldr Config is a tool for configuring your JavaScript applications. Sharing similarities, yet expanding upon the shortfalls of other configuration tools.

Configuration values can be loaded from argv flags, environment variables, JSON config files, and YAML files.  

`yarn add boldr-config` or `npm install --save boldr-config`


### Config Files and Loading Priority
Boldr Config crawls multiple paths searching for configuration files. Once found, the values are merged based on a hierarchy (explained below), placed into a single object, and loaded into your application.

1. argv flags passed through the command line.
`--db--host value` translates to `config.db.host === 'value'`
2. Environment variables
defined as `MY_APP__DB__HOST_NAME=value` translates to `config.db.hostName === 'value'`
**Anything below can be json5 or yaml** (requires installing js-yaml)
3. ./.appNamerc
4. ../.appNamerc
5. ../../.appNamerc
6. ...


## Usage

`yarn add boldr-config` or `npm install --save boldr-config`

Create a new instance of BoldrConfig, pass it your application name 'boldr' followed by an object containing keys and values for your application. This will be set as the default config.


Example `config.js`

```JavaScript
### config.js
import BoldrConfig from 'boldr-config';
//                   new instance   'name', keys/values
const boldrConfig = new BoldrConfig('boldr', {
  server: {
    port: 2121,
    host: '127.0.0.1',
    apiPrefix: '/api/v1',
    siteUrl: 'http://localhost:3000',
  },
  logging: {
    level: 'debug',
    file: {
      enable: true,
      dir: 'logs',
      level: 'info',
      filename: 'boldr.api',
    },
  },
});
```

Now that the configuration is defined let's finish off the remainder of the file.

Create a constant config. You can call it anything you'd like (config makes the most sense to me).  `const config = boldrConfig`

Set it equal to boldrConfig and call the toObject method on it. `const config = boldrConfig.toObject()`

This is your config which you can now export, access it anywhere in your app and get values like you would any json object.


```JavaScript
### config.js / part2
// ...^
const boldrConfig = new BoldrConfig('boldr', {});
// toObject method
const config = boldrConfig.toObject();

// Retrieve values as normal.
// ex: const db = config.db.name
export default config;

// What is this? See below on how you can use it.
export { boldrConfig };
```

## Display Config
It's possible to print out your configuration to stdout. When the configuration is printed, the source where the value was loaded from is also displayed.

To take advantage of this feature, call the `displayConfig()` method on your BoldrConfig instance.

```JavaScript
...^
import BoldrConfig from 'boldr-config';
const boldrConfig = new BoldrConfig('boldr', { ... });
const config = boldrConfig.toObject();
export { boldrConfig };

## server.js
import config, { boldrConfig } from './config';

console.log(boldrConfig.displayConfig());
```

Executing the displayConfig method will print what you see below to stdout.

```
  Displaying config for boldr
┌───────────────────────┬─────────────────────────────────────────────┬
│ Path                  │ Value                                             │ Source      │
│ server.port           │ 2121                                              │ .boldrrc    │
│ server.host           │ "127.0.0.1"                                       │ .boldrrc    │
│ server.apiPrefix      │ "/api/v1"                                         │ defaults    │
│ server.siteUrl        │ "http://localhost:3000"                           │ defaults    │
│ logging.level         │ "debug"                                           │ .boldrrc    │
│ logging.file.enable   │ true                                              │ defaults    │
│ db.debug              │ false                                             │ defaults    │
│ redis.url             │ "redis://redis:6379/0"                            │ environment │
└──────────────────┴───────────────────────────────────────────────────┴
```
