# :bulb: next-compose-plugins [![npm version](https://badgen.net/npm/v/next-compose-plugins)](https://www.npmjs.com/package/next-compose-plugins) [![license](https://badgen.net/github/license/cyrilwanner/next-compose-plugins)](https://github.com/cyrilwanner/next-compose-plugins/blob/master/LICENSE) [![downloads](https://badgen.net/npm/dt/next-compose-plugins)](https://www.npmjs.com/package/next-compose-plugins)

Provides a cleaner API for enabling and configuring plugins for [next.js](https://github.com/zeit/next.js) because the default way next.js suggests to enable and configure plugins can get unclear and confusing when you have many plugins.

It is often unclear which plugins are enabled or which configuration belongs to which plugin because they are nested and share one configuration object.
This can also lead to orphaned configuration values when updating or removing plugins.

While `next-compose-plugins` tries to eliminate this case by providing an alternative API for enabling and configuring plugins where each plugin has their own configuration object, it also adds more features like phase specific plugins and configuration.

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
  - [`withPlugins`](#usage)
  - [Optional plugins](#optional-plugins)
  - [Extend another config file](#extend-another-config-file)
- [Plugin developers](#plugin-developers)
- [Examples](#examples)
- [See also](#see-also)
- [License](#license)

## Installation

```
npm install --save next-compose-plugins
```

This plugin requires next.js `>= 5.1` because it depends on the phases introduced within this version.
If you are still on `5.0.x`, you can install v1 of this plugin: `npm install --save next-compose-plugins@1`.

## Usage
```javascript
// next.config.js
const withPlugins = require('next-compose-plugins');

module.exports = withPlugins([...plugins], nextConfiguration);
```

### `plugins`

> See the [examples](#examples) for more use-cases.

It is an array containing all plugins and their configuration.
If a plugin does not need additional configuration, you can simply add the imported plugin.
If it does need configuration or you only want to run it in a specific phase, you can specify an array:

#### `[plugin: function, configuration?: object, phases?: array]`

##### `plugin: function`

Imported plugin.
See the [optional plugins](#optional-plugins) section if you only want to require a plugin when it is really used.

```javascript
const withPlugins = require('next-compose-plugins');
const sass = require('@zeit/next-sass');

module.exports = withPlugins([
  [sass],
]);
```

##### `configuration?: object`

Configuration for the plugin.

You can also overwrite specific configuration keys for a phase:

```javascript
const withPlugins = require('next-compose-plugins');
const { PHASE_PRODUCTION_BUILD } = require('next-server/constants');
const sass = require('@zeit/next-sass');

module.exports = withPlugins([
  [sass, {
    cssModules: true,
    cssLoaderOptions: {
      localIdentName: '[path]___[local]___[hash:base64:5]',
    },
    [PHASE_PRODUCTION_BUILD]: {
      cssLoaderOptions: {
        localIdentName: '[hash:base64:8]',
      },
    },
  }],
]);
```

This will overwrite the `cssLoaderOptions` with the new `localIdentName` specified, but **only** during production build.
You can also combine multiple phases (`[PHASE_PRODUCTION_BUILD + PHASE_PRODUCTION_SERVER]: {}`) or exclude a phase (`['!' + PHASE_PRODUCTION_BUILD]: {}` which will overwrite the config in all phases except `PRODUCTION_BUILD`).
You can use all phases [next.js provides](https://github.com/zeit/next.js/blob/canary/packages/next-server/lib/constants.ts).

##### `phases?: array`

If the plugin should only be applied in specific phases, you can specify them here.
You can use all phases [next.js provides](https://github.com/zeit/next.js/blob/canary/packages/next-server/lib/constants.ts).

```javascript
const withPlugins = require('next-compose-plugins');
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } = require('next-server/constants');
const sass = require('@zeit/next-sass');

module.exports = withPlugins([
  [sass, {
    cssModules: true,
    cssLoaderOptions: {
      localIdentName: '[path]___[local]___[hash:base64:5]',
    },
  }, [PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD]],
]);
```

You can also negate the phases with a leading `!`:

```javascript
const withPlugins = require('next-compose-plugins');
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } = require('next-server/constants');
const sass = require('@zeit/next-sass');

module.exports = withPlugins([
  [sass, {
    cssModules: true,
    cssLoaderOptions: {
      localIdentName: '[path]___[local]___[hash:base64:5]',
    },
  }, ['!', PHASE_DEVELOPMENT_SERVER]],
]);
```

This will apply the plugin in all phases except `PHASE_DEVELOPMENT_SERVER`.

### `nextConfiguration`

Any direct [next.js configuration](https://github.com/zeit/next.js#custom-configuration) can go here, for example: `{distDir: 'dist'}`.

You can also customize the webpack configuration of next.js within this object.

```javascript
const withPlugins = require('next-compose-plugins');

const nextConfig = {
  distDir: 'build',
  webpack: (config, options) => {

    // modify the `config` here

    return config;
  },
};

module.exports = withPlugins([
  // add plugins here..
], nextConfig);
```

Phases are also supported within the `nextConfiguration` object and have the same syntax as in [plugin `configuration` objects](#configuration-object).
```javascript
const { PHASE_DEVELOPMENT_SERVER } = require('next-server/constants');
const nextConfig = {
  distDir: 'build',
  ['!' + PHASE_DEVELOPMENT_SERVER]: {
    assetPrefix: 'https://my.cdn.com',
  },
};
```

### Optional plugins

If a plugin should only get loaded when it is used, you can use the `optional` helper function.
This can especially be useful if the plugin is only in the `devDependencies` and so may not be available in all phases.
If you don't use the `optional` helper in this case, you would get an error.

```javascript
const { withPlugins, optional } = require('next-compose-plugins');
const { PHASE_DEVELOPMENT_SERVER } = require('next-server/constants');

module.exports = withPlugins([
  [optional(() => require('@zeit/next-sass')), { /* optional configuration */ }, [PHASE_DEVELOPMENT_SERVER]],
]);
```

### Extend another config file

It sometimes makes sense to split a `next.config.js` file into multiple files, for example when you have more than just one next.js project in one repository.
You can then define the base config in one file and add project specific plugins/settings in the config file or the project.

To easily archive this, you can use the `extend` helper in the `next.config.js` file of your project.

```javascript
// next.config.js
const { withPlugins, extend } = require('next-compose-plugins');
const baseConfig = require('./base.next.config.js');

const nextConfig = { /* ... */ };

module.exports = extend(baseConfig).withPlugins([
  [sass, {
    cssModules: true,
  }],
], nextConfig);
```

```javascript
// base.next.config.js
const withPlugins = require('next-compose-plugins');

module.exports = withPlugins([
  [typescript, {
    typescriptLoaderOptions: {
      transpileOnly: false,
    },
  }],
]);
```

## Plugin developers

This plugin has a few extra functionality which you can use as a plugin developer.
However, if you use them, you should mention somewhere in your readme or install instructions that it needs `next-compose-plugins` to have all features available and so it won't confuse your users if something is not working as described out-of-the-box because they don't use this compose plugin yet.

### Phases

You can specify in which phases your plugin should get executed within the object you return:

```javascript
const { PHASE_DEVELOPMENT_SERVER } = require('next-server/constants');

module.exports = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    // define in which phases this plugin should get applied.
    // you can also use multiple phases or negate them.
    // however, users can still overwrite them in their configuration if they really want to.
    phases: [PHASE_DEVELOPMENT_SERVER],

    webpack(config, options) {
      // do something here which only gets applied during development server phase

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  };
};
```

These phases are handled as a default configuration and users can overwrite the phases in their `next.config.js` file if they want to.
See [phases configuration](#phases-array) for all available options.

### Additional information

When a plugin gets loaded with `next-compose-plugins`, some additional information on which you can depend is available.
It gets passed in as the second argument to your plugin function:

```javascript
module.exports = (nextConfig = {}, nextComposePlugins = {}) => {
  console.log(nextComposePlugins);
};
```

Currently, it contains these values:

```javascript
{
  // this is always true when next-compose-plugins is used
  // so you can use this as a check when your plugin depends on it
  nextComposePlugins: boolean,

  // the current phase which gets applied
  phase: string,
}
```

## Examples

### Basic example

```javascript
// next.config.js
const withPlugins = require('next-compose-plugins');
const images = require('next-images');
const sass = require('@zeit/next-sass');
const typescript = require('@zeit/next-typescript');

// next.js configuration
const nextConfig = {
  useFileSystemPublicRoutes: false,
  distDir: 'build',
};

module.exports = withPlugins([

  // add a plugin with specific configuration
  [sass, {
    cssModules: true,
    cssLoaderOptions: {
      localIdentName: '[local]___[hash:base64:5]',
    },
  }],

  // add a plugin without a configuration
  images,

  // another plugin with a configuration
  [typescript, {
    typescriptLoaderOptions: {
      transpileOnly: false,
    },
  }],

], nextConfig);
```

### Advanced example

```javascript
// next.config.js
const { withPlugins, optional } = require('next-compose-plugins');
const images = require('next-images');
const sass = require('@zeit/next-sass');
const typescript = require('@zeit/next-typescript');

const {
  PHASE_PRODUCTION_BUILD,
  PHASE_PRODUCTION_SERVER,
  PHASE_DEVELOPMENT_SERVER,
  PHASE_EXPORT,
} = require('next-server/constants');

// next.js configuration
const nextConfig = {
  useFileSystemPublicRoutes: false,
  distDir: 'build',
};

module.exports = withPlugins([

  // add a plugin with specific configuration
  [sass, {
    cssModules: true,
    cssLoaderOptions: {
      localIdentName: '[local]___[hash:base64:5]',
    },
    [PHASE_PRODUCTION_BUILD + PHASE_EXPORT]: {
      cssLoaderOptions: {
        localIdentName: '[hash:base64:8]',
      },
    },
  }],

  // add a plugin without a configuration
  images,

  // another plugin with a configuration (applied in all phases except development server)
  [typescript, {
    typescriptLoaderOptions: {
      transpileOnly: false,
    },
  }, ['!', PHASE_DEVELOPMENT_SERVER]],

  // load and apply a plugin only during development server phase
  [optional(() => require('@some-internal/dev-log')), [PHASE_DEVELOPMENT_SERVER]],

], nextConfig);
```

### Comparison

As a comparison, it would look like this without this plugin where it is not really clear which configuration belongs to which plugin and what are all the enabled plugins. Many features mentioned above will also not be possible or requires you to have a lot more custom code in your config file.

```javascript
// next.config.js
const withSass = require('@zeit/next-sass');
const withTypescript = require('@zeit/next-typescript');
const withImages = require('next-images');
const withOffline = require('next-offline');

module.exports = withSass(withOffline(withTypescript(withImages({
    {
        cssModules: true,
        cssLoaderOptions: {
            importLoaders: 1,
            localIdentName: '[local]___[hash:base64:5]',
        },
        typescriptLoaderOptions: {
            transpileOnly: false,
        },
        useFileSystemPublicRoutes: false,
        distDir: 'build',
        workerName: 'sw.js',
        imageTypes: ['jpg', 'png'],
    }
}))));
```

## See also

See [zeit/next-plugins](https://github.com/zeit/next-plugins) for a list of official and community made plugins for [next.js](https://github.com/zeit/next.js).

## License

[MIT](https://github.com/cyrilwanner/next-compose-plugins/blob/master/LICENSE) © Cyril Wanner
