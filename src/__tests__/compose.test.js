import 'jest';
import { parsePluginConfig } from '../compose';

const testPlugin = { test: 'plugin' };

const PHASE_DEVELOPMENT_SERVER = 'phase-development-server';
const PHASE_PRODUCTION_SERVER = 'phase-production-server';
const PHASE_PRODUCTION_BUILD = 'phase-production-build';

describe('next-compose-plugins/compose', () => {
  /**
   * parsePluginConfig
   *
   * ----------------------------------------------------
   */
  it('parses the plugin without a configuration', () => {
    const withoutConfig1 = parsePluginConfig(testPlugin);
    expect(withoutConfig1).toEqual({
      pluginFunction: { test: 'plugin' },
      pluginConfig: {},
      phases: null,
    });
    expect(withoutConfig1.pluginFunction).toBe(testPlugin); // test same reference

    const withoutConfig2 = parsePluginConfig([testPlugin]);
    expect(withoutConfig2).toEqual({
      pluginFunction: { test: 'plugin' },
      pluginConfig: {},
      phases: null,
    });
    expect(withoutConfig2.pluginFunction).toBe(testPlugin);
  });

  it('parses the plugin with a configuration', () => {
    const withConfig = parsePluginConfig([testPlugin, { my: 'conf', nested: { foo: 'bar' } }]);

    expect(withConfig).toEqual({
      pluginFunction: { test: 'plugin' },
      pluginConfig: { my: 'conf', nested: { foo: 'bar' } },
      phases: null,
    });

    expect(withConfig.pluginFunction).toBe(testPlugin);
  });

  it('parses the plugin with a phase restriction', () => {
    const withPhaseRestriction = parsePluginConfig([testPlugin, [
      PHASE_DEVELOPMENT_SERVER,
      PHASE_PRODUCTION_BUILD,
      PHASE_PRODUCTION_SERVER,
    ]]);

    expect(withPhaseRestriction).toEqual({
      pluginFunction: { test: 'plugin' },
      pluginConfig: {},
      phases: [PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER],
    });

    expect(withPhaseRestriction.pluginFunction).toBe(testPlugin);
  });

  /**
   * composePlugins
   *
   * ----------------------------------------------------
   */
  it('composePlugins just works', () => {
    // todo: actually test if it really works :)
  });
});
