import 'jest';
import { isInCurrentPhase, mergePhaseConfiguration } from '../phases';

const PHASE_DEVELOPMENT_SERVER = 'phase-development-server';
const PHASE_PRODUCTION_SERVER = 'phase-production-server';
const PHASE_PRODUCTION_BUILD = 'phase-production-build';

describe('next-compose-plugins/phases', () => {
  /**
   * isInCurrentPhase
   *
   * -----------------------------------------------------------------------
   */
  it('checks when a plugin should get applied in the current phase', () => {
    // check array syntax
    expect(isInCurrentPhase(PHASE_DEVELOPMENT_SERVER, [PHASE_DEVELOPMENT_SERVER])).toEqual(true);
    expect(isInCurrentPhase(PHASE_DEVELOPMENT_SERVER, [
      PHASE_PRODUCTION_SERVER,
      PHASE_DEVELOPMENT_SERVER,
    ])).toEqual(true);
    expect(isInCurrentPhase(PHASE_DEVELOPMENT_SERVER, [
      PHASE_DEVELOPMENT_SERVER,
      PHASE_PRODUCTION_SERVER,
    ])).toEqual(true);

    // check string syntax
    expect(isInCurrentPhase(PHASE_DEVELOPMENT_SERVER, PHASE_DEVELOPMENT_SERVER)).toEqual(true);
    expect(isInCurrentPhase(PHASE_DEVELOPMENT_SERVER, PHASE_DEVELOPMENT_SERVER +
      PHASE_PRODUCTION_SERVER)).toEqual(true);
    expect(isInCurrentPhase(PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_SERVER +
      PHASE_DEVELOPMENT_SERVER)).toEqual(true);
  });

  it('checks when a plugin should not get applied in the current phase', () => {
    // check array syntax
    expect(isInCurrentPhase(PHASE_PRODUCTION_BUILD, [PHASE_DEVELOPMENT_SERVER])).toEqual(false);
    expect(isInCurrentPhase(PHASE_PRODUCTION_BUILD, [
      PHASE_PRODUCTION_SERVER,
      PHASE_DEVELOPMENT_SERVER,
    ])).toEqual(false);
    expect(isInCurrentPhase(PHASE_PRODUCTION_BUILD, [
      PHASE_DEVELOPMENT_SERVER,
      PHASE_PRODUCTION_SERVER,
    ])).toEqual(false);

    // check string syntax
    expect(isInCurrentPhase(PHASE_PRODUCTION_BUILD, PHASE_DEVELOPMENT_SERVER)).toEqual(false);
    expect(isInCurrentPhase(PHASE_PRODUCTION_BUILD, PHASE_DEVELOPMENT_SERVER +
      PHASE_PRODUCTION_SERVER)).toEqual(false);
    expect(isInCurrentPhase(PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER +
      PHASE_DEVELOPMENT_SERVER)).toEqual(false);
  });

  it('checks when a plugin should get applied in the current phase with a negated config', () => {
    // check array syntax
    expect(isInCurrentPhase(PHASE_DEVELOPMENT_SERVER, ['!', PHASE_PRODUCTION_SERVER])).toEqual(true);
    expect(isInCurrentPhase(PHASE_DEVELOPMENT_SERVER, [
      '!',
      PHASE_PRODUCTION_SERVER,
      PHASE_PRODUCTION_BUILD,
    ])).toEqual(true);

    // check string syntax
    expect(isInCurrentPhase(PHASE_DEVELOPMENT_SERVER, `!${PHASE_PRODUCTION_SERVER}`)).toEqual(true);
    expect(isInCurrentPhase(PHASE_DEVELOPMENT_SERVER, `!${PHASE_PRODUCTION_SERVER}${PHASE_PRODUCTION_BUILD}`)).toEqual(true);
  });

  it('checks when a plugin should not get applied in the current phase with a negated config', () => {
    // check array syntax
    expect(isInCurrentPhase(PHASE_PRODUCTION_BUILD, ['!', PHASE_PRODUCTION_BUILD])).toEqual(false);
    expect(isInCurrentPhase(PHASE_PRODUCTION_BUILD, [
      '!',
      PHASE_PRODUCTION_BUILD,
      PHASE_DEVELOPMENT_SERVER,
    ])).toEqual(false);
    expect(isInCurrentPhase(PHASE_PRODUCTION_BUILD, [
      '!',
      PHASE_DEVELOPMENT_SERVER,
      PHASE_PRODUCTION_BUILD,
    ])).toEqual(false);

    // check string syntax
    expect(isInCurrentPhase(PHASE_PRODUCTION_BUILD, `!${PHASE_PRODUCTION_BUILD}`)).toEqual(false);
    expect(isInCurrentPhase(PHASE_PRODUCTION_BUILD, `!${PHASE_DEVELOPMENT_SERVER}${PHASE_PRODUCTION_BUILD}`)).toEqual(false);
    expect(isInCurrentPhase(PHASE_PRODUCTION_BUILD, `!${PHASE_PRODUCTION_BUILD}${PHASE_DEVELOPMENT_SERVER}`)).toEqual(false);
  });

  /**
   * mergePhaseConfiguration
   *
   * ----------------------------------------------
   */
  it('merges phase specific configuration', () => {
    const pluginConfig = {
      build: 'default-build',
      cssModules: true,
      nested: {
        conf: true,
      },
    };

    const nothingMerged = mergePhaseConfiguration(PHASE_PRODUCTION_SERVER, {
      ...pluginConfig,
      [PHASE_DEVELOPMENT_SERVER]: {
        build: 'dev-build',
      },
      [PHASE_PRODUCTION_BUILD]: {
        build: 'prod-build',
        nested: {
          conf: false,
        },
      },
    });

    expect(nothingMerged).toEqual({
      build: 'default-build',
      cssModules: true,
      nested: {
        conf: true,
      },
    });
    expect(Object.keys(nothingMerged)).not.toContain(PHASE_DEVELOPMENT_SERVER);
    expect(Object.keys(nothingMerged)).not.toContain(PHASE_PRODUCTION_SERVER);

    const devMerged = mergePhaseConfiguration(PHASE_DEVELOPMENT_SERVER, {
      ...pluginConfig,
      [PHASE_DEVELOPMENT_SERVER]: {
        build: 'dev-build',
      },
      [PHASE_PRODUCTION_BUILD + PHASE_PRODUCTION_SERVER]: {
        build: 'prod-build',
        nested: {
          conf: false,
        },
      },
    });

    expect(devMerged).toEqual({
      build: 'dev-build',
      cssModules: true,
      nested: {
        conf: true,
      },
    });
    expect(Object.keys(devMerged)).not.toContain(PHASE_DEVELOPMENT_SERVER);
    expect(Object.keys(devMerged)).not.toContain(PHASE_PRODUCTION_SERVER);

    const prodMerged = mergePhaseConfiguration(PHASE_PRODUCTION_SERVER, {
      ...pluginConfig,
      [PHASE_DEVELOPMENT_SERVER]: {
        build: 'dev-build',
      },
      [PHASE_PRODUCTION_BUILD + PHASE_PRODUCTION_SERVER]: {
        build: 'prod-build',
        nested: {
          conf: false,
        },
      },
    });

    expect(prodMerged).toEqual({
      build: 'prod-build',
      cssModules: true,
      nested: {
        conf: false,
      },
    });
    expect(Object.keys(prodMerged)).not.toContain(PHASE_DEVELOPMENT_SERVER);
    expect(Object.keys(prodMerged)).not.toContain(PHASE_PRODUCTION_SERVER);
  });
});
