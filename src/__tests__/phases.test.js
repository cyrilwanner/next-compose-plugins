import 'jest';
import { needsPhases, isInCurrentPhase, mergePhaseConfiguration } from '../phases';

const testPlugin = {};

const PHASE_DEVELOPMENT_SERVER = 'phase-development-server';
const PHASE_PRODUCTION_SERVER = 'phase-production-server';
const PHASE_PRODUCTION_BUILD = 'phase-production-build';

describe('next-compose-plugins/phases', () => {
  it('detects if a configuration needs phases', () => {
    expect(needsPhases([[testPlugin, { my: 'conf' }, [PHASE_DEVELOPMENT_SERVER]]])).toEqual(true);
    expect(needsPhases([[testPlugin, [PHASE_DEVELOPMENT_SERVER]]])).toEqual(true);
    expect(needsPhases([[testPlugin, { [PHASE_DEVELOPMENT_SERVER]: { my: 'conf' } }]])).toEqual(true);
    expect(needsPhases([[testPlugin], [testPlugin, { my: 'conf' }, [PHASE_DEVELOPMENT_SERVER]]])).toEqual(true);
    expect(needsPhases([[testPlugin, { my: 'conf' }, [PHASE_DEVELOPMENT_SERVER]]], [testPlugin])).toEqual(true);
  });

  it('detects if a configuration does not need phases', () => {
    expect(needsPhases([testPlugin])).toEqual(false);
    expect(needsPhases([[testPlugin]])).toEqual(false);
    expect(needsPhases([[testPlugin, { my: 'conf' }]])).toEqual(false);
    expect(needsPhases([testPlugin, [testPlugin, {}]])).toEqual(false);
    expect(needsPhases([[testPlugin, {}], testPlugin])).toEqual(false);
  });

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

  it('merges phase specific configuration', () => {
    const pluginConfig = {
      build: 'default-build',
      cssModules: true,
      nested: {
        conf: true,
      },
    };

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

    expect(devMerged).toMatchObject({
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

    expect(prodMerged).toMatchObject({
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
