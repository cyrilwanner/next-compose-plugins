import { composePlugins } from './compose';

/**
 * Composes all plugins together.
 *
 * @param {array} plugins - all plugins to load and initialize
 * @param {object} nextConfig - direct configuration for next.js (optional)
 */
export const withPlugins = ([...plugins], nextConfig = {}) => (phase, { defaultConfig }) => {
  const config = {
    ...defaultConfig,
    ...nextConfig,
  };

  return composePlugins(phase, plugins, config);
};

export const optional = () => {
  // todo
};

export default withPlugins;
