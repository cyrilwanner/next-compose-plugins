/**
 * Check if at least one of the plugin configuration depends on phases
 *
 * @param {array} plugins
 */
export const needsPhases = (plugins) => {
  const res = plugins.some((plugin) => {
    // if it has no specific config, it can't depend on phases
    if (!(plugin instanceof Array)) {
      return false;
    }

    // if the plugin array contains 3 values, it always depends on phases
    // [plugin, config, phases]
    if (plugin.length > 2) {
      return true;
    }

    // if the plugin array contains 2 values and the second one is an array, it depends on phases
    // [plugin, phases]
    if (plugin.length > 1 && plugin[1] instanceof Array) {
      return true;
    }

    // check if there is a phase specific config in the config object
    // [plugin, config]
    if (plugin.length > 1) {
      return Object.keys(plugin[1]).some(value => value.startsWith('phase-'));
    }

    return false;
  });

  return res;
};

/**
 * Check if the current phase is in the phase config and so a plugin should get applied
 *
 * @param {string} currentPhase - current phase
 * @param {array|string} phaseConfig - phase config in an array ([PHASE1, PHASE2])
 *                                     or string (PHASE1 + PHASE2)
 */
export const isInCurrentPhase = (currentPhase, phaseConfig) => {
  // phase config can be an array or string, so always convert it to a string
  const parsedPhaseConfig = phaseConfig instanceof Array ? phaseConfig.join('') : phaseConfig;

  // negate the check
  if (parsedPhaseConfig.substr(0, 1) === '!') {
    return parsedPhaseConfig.indexOf(currentPhase) < 0;
  }

  return parsedPhaseConfig.indexOf(currentPhase) >= 0;
};

/**
 * Merge the configuration of a plugin with specific values only applied on the current phase
 *
 * @param {string} currentPhase - current phase
 * @param {object} config - plugin configuration
 */
export const mergePhaseConfiguration = (currentPhase, config) => {
  let mergedConfig = {};

  Object.keys(config).forEach((key) => {
    if (key.startsWith('phase-') || key.startsWith('!phase-')) {
      if (isInCurrentPhase(currentPhase, key)) {
        mergedConfig = {
          ...mergedConfig,
          ...config[key],
        };
      }
    } else {
      mergedConfig[key] = config[key];
    }
  });

  return mergedConfig;
};
