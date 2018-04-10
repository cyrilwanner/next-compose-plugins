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
