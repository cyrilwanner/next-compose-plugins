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

// define exports
const exports = withPlugins;
exports.withPlugins = withPlugins;
exports.optional = markOptional;

module.exports = exports;
