# 💡 next-plugins [![npm version](https://img.shields.io/npm/v/next-plugins.svg)](https://www.npmjs.com/package/next-plugins) [![license](https://img.shields.io/github/license/cyrilwanner/next-plugins.svg)](https://github.com/cyrilwanner/next-plugins/blob/master/LICENSE)

Provides a cleaner API for enabling and configuring plugins for [next.js](https://github.com/zeit/next.js) because the default way next.js proposes to enable and configure plugins can get unclear and confusing when you have many plugins.

It is often unclear which plugins are enabled or which configuration belongs to which plugin because they are nested and share one configuration object.
This can also lead to orphaned configuration values when updating or removing plugins.

`next-plugins` tries to eliminate this case by providing an alternative API for enabling and configuring plugins where each plugin has their own configuration object.

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [Example](#example)
- [License](#license)

## Installation

```
npm install --save next-plugins
```

## Usage
```javascript
// next.config.js
const withPlugins = require('next-plugins');

module.exports = withPlugins([...plugins], nextConfiguration);
```

### `plugins`

Is an array containing all plugins and their configuration.
If a plugin does not need additional configuration, you can simply add the imported plugin.
If it does need configuration, you can specify an array where the first element is the plugin and the second its configuration: `[sass, {mySassConfig: 'foobar'}]` (see [example](#example)).

### `nextConfiguration`

Any direct [next.js configuration](https://github.com/zeit/next.js#custom-configuration) can go here, for example: `{distDir: 'dist'}`.

## Example

```javascript
// next.config.js
const withPlugins = require('next-plugins');
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
      importLoaders: 1,
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

As a comparison, it would look like this without this plugin where it is not really clear which configuration belongs to which plugin and what are all the enabled plugins:

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

## License

[MIT](https://github.com/cyrilwanner/next-plugins/blob/master/LICENSE)
