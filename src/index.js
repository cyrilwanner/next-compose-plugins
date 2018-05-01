import { composePlugins } from './compose';
import { markOptional } from './optional';

/**
 * Composes all plugins together.
 *
 * @param {array} plugins - all plugins to load and initialize
 * @param {object} nextConfig - direct configuration for next.js (optional)
 */
const withPlugins = ([...plugins], nextConfig = {}) => (phase, { defaultConfig }) => {
  const config = {
    ...defaultConfig,
    ...nextConfig,
  };

  return composePlugins(phase, plugins, config);
};

/**
 * Extends a base next config.
 *
 * @param {function} baseConfig - basic configuration
 */
const extend = baseConfig => ({
  withPlugins: (...params) => (phase, nextOptions) => {
    const processedBaseConfig = baseConfig(phase, nextOptions);

    return withPlugins(...params)(phase, {
      ...nextOptions,
      defaultConfig: processedBaseConfig,
    });
  },
});

// define exports
const exports = withPlugins;
exports.withPlugins = withPlugins;
exports.optional = markOptional;
exports.extend = extend;

module.exports = exports;
