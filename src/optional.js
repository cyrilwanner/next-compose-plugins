export const OPTIONAL_SYMBOL = Symbol('__NEXT_COMPOSE_PLUGINS_OPTIONAL');

/**
 * Marks a plugin as optional
 *
 * @param {function} plugin - function which requires a plugin
 */
export const markOptional = (plugin) => {
  plugin[OPTIONAL_SYMBOL] = true; // eslint-disable-line no-param-reassign

  return plugin;
};

/**
 * Check if a plugin has been marked as optional before
 *
 * @param {function} plugin - plugin to check
 */
export const isOptional = plugin => plugin[OPTIONAL_SYMBOL] === true;

/**
 * Resolve an optional plugin
 *
 * @param {function} plugin - function which requires a plugin
 */
export const resolveOptionalPlugin = plugin => plugin();
