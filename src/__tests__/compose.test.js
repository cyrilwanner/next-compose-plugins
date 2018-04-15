import 'jest';
import { parsePluginConfig, composePlugins } from '../compose';
import { markOptional } from '../optional';

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
  it('passed down the initial configuration', () => {
    const plugin = jest.fn((nextConfig) => {
      expect(nextConfig).toEqual({ initial: 'config' });

      return nextConfig;
    });

    const result = composePlugins(PHASE_DEVELOPMENT_SERVER, [plugin], { initial: 'config' });

    expect(result).toEqual({ initial: 'config' });
    expect(plugin).toHaveBeenCalledTimes(1);
  });

  it('does not execute a plugin if it is not in the correct phase', () => {
    const plugin1 = jest.fn(nextConfig => ({ ...nextConfig, plugin1: true }));
    const plugin2 = jest.fn(nextConfig => ({ ...nextConfig, plugin2: true }));
    const plugin3 = jest.fn(nextConfig => ({ ...nextConfig, plugin3: true }));

    const result = composePlugins(PHASE_DEVELOPMENT_SERVER, [
      [plugin1, [PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD]],
      [plugin2, [PHASE_PRODUCTION_BUILD]],
      [plugin3, ['!', PHASE_PRODUCTION_SERVER]],
    ], { initial: 'config' });

    expect(result).toEqual({
      initial: 'config',
      plugin1: true,
      plugin3: true,
    });

    expect(plugin1).toHaveBeenCalledTimes(1);
    expect(plugin2).toHaveBeenCalledTimes(0);
    expect(plugin3).toHaveBeenCalledTimes(1);
  });

  it('merges the plugin configuration', () => {
    const plugin1 = jest.fn((nextConfig) => {
      expect(nextConfig.plugin1Config).toEqual('bar');

      return nextConfig;
    });

    const plugin2 = jest.fn((nextConfig) => {
      expect(nextConfig.plugin2Config).toEqual({ hello: 'world' });

      return nextConfig;
    });

    const plugin3 = jest.fn((nextConfig) => {
      expect(nextConfig.plugin3Config).toEqual(false);

      return nextConfig;
    });

    composePlugins(PHASE_DEVELOPMENT_SERVER, [
      [plugin1, {
        plugin1Config: 'bar',
        [PHASE_PRODUCTION_SERVER]: {
          plugin1Config: 'foo',
        },
      }],
      [plugin2, {
        plugin2Config: { hey: 'you' },
        [PHASE_DEVELOPMENT_SERVER]: {
          plugin2Config: { hello: 'world' },
        },
      }],
      [plugin3, {
        plugin3Config: true,
        [PHASE_PRODUCTION_BUILD + PHASE_DEVELOPMENT_SERVER]: {
          plugin3Config: false,
        },
      }],
    ], {});

    expect(plugin1).toHaveBeenCalledTimes(1);
    expect(plugin2).toHaveBeenCalledTimes(1);
    expect(plugin3).toHaveBeenCalledTimes(1);
  });

  it('provides next-compose-plugin infos for plugins', () => {
    const plugin = jest.fn((nextConfig, info) => {
      expect(info).toEqual({
        nextComposePlugins: true,
        phase: PHASE_DEVELOPMENT_SERVER,
      });

      return nextConfig;
    });

    composePlugins(PHASE_DEVELOPMENT_SERVER, [plugin], {});

    expect(plugin).toHaveBeenCalledTimes(1);
  });

  it('does not pass down the updated configuration if it is in the wrong phase', () => {
    const plugin1 = jest.fn(nextConfig => ({
      ...nextConfig,
      plugin1Config: 'foo',
      phases: [PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD],
    }));

    const plugin2 = jest.fn(nextConfig => ({
      ...nextConfig,
      plugin2Config: 'bar',
      webpack: () => `changed ${nextConfig.webpack()}`,
      phases: [PHASE_DEVELOPMENT_SERVER],
    }));

    const plugin3 = jest.fn(nextConfig => ({
      ...nextConfig,
      plugin3Config: 'world',
    }));

    const webpackConfig = () => 'initial webpack config';

    const result = composePlugins(PHASE_PRODUCTION_BUILD, [plugin1, plugin2, plugin3], {
      initial: 'config',
      webpack: webpackConfig,
    });

    expect(result).toEqual({
      initial: 'config',
      plugin1Config: 'foo',
      plugin3Config: 'world',
      webpack: webpackConfig,
    });

    expect(result.webpack()).toEqual('initial webpack config');

    expect(plugin1).toHaveBeenCalledTimes(1);
    expect(plugin2).toHaveBeenCalledTimes(1);
    expect(plugin3).toHaveBeenCalledTimes(1);
  });

  it('lets the user overwrite the plugins phase', () => {
    const plugin1 = jest.fn(nextConfig => ({
      ...nextConfig,
      plugin1Config: 'foo',
      phases: [PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD],
    }));

    const plugin2 = jest.fn(nextConfig => ({
      ...nextConfig,
      plugin2Config: 'bar',
      phases: [PHASE_DEVELOPMENT_SERVER],
    }));

    const result = composePlugins(PHASE_PRODUCTION_BUILD, [plugin1, [plugin2, [PHASE_PRODUCTION_BUILD]]], { initial: 'config' });

    expect(result).toEqual({
      initial: 'config',
      plugin1Config: 'foo',
      plugin2Config: 'bar',
    });

    expect(plugin1).toHaveBeenCalledTimes(1);
    expect(plugin2).toHaveBeenCalledTimes(1);
  });

  it('does not pass down the phase configuration of the previous plugin', () => {
    const plugin1 = jest.fn(({ plugin1Config, ...nextConfig }) => {
      expect(nextConfig).toEqual({ initial: 'config' });
      expect(plugin1Config).toEqual('foo');

      return nextConfig;
    });

    const plugin2 = jest.fn(({ plugin2Config, ...nextConfig }) => {
      expect(nextConfig).toEqual({ initial: 'config' });
      expect(plugin2Config).toEqual('bar');

      return nextConfig;
    });

    const result = composePlugins(PHASE_DEVELOPMENT_SERVER, [
      [plugin1, { plugin1Config: 'foo' }],
      [plugin2, { plugin2Config: 'bar' }],
    ], { initial: 'config' });

    expect(result).toEqual({ initial: 'config' });

    expect(plugin1).toHaveBeenCalledTimes(1);
    expect(plugin2).toHaveBeenCalledTimes(1);
  });

  it('does not change a reference but always creates new objects', () => {
    const plugin1 = jest.fn(nextConfig => ({
      ...nextConfig,
      plugin1Config: 'foo',
      phases: [PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD],
    }));

    const plugin2 = jest.fn((nextConfig) => {
      nextConfig.illegallyUpdated = true; // eslint-disable-line no-param-reassign

      return {
        ...nextConfig,
        plugin2Config: 'bar',
        phases: [PHASE_DEVELOPMENT_SERVER],
      };
    });

    const plugin3 = jest.fn(nextConfig => ({
      ...nextConfig,
      plugin3Config: 'world',
    }));

    const result = composePlugins(PHASE_PRODUCTION_BUILD, [plugin1, plugin2, plugin3], { initial: 'config' });

    expect(result).toEqual({
      initial: 'config',
      plugin1Config: 'foo',
      plugin3Config: 'world',
    });

    expect(plugin1).toHaveBeenCalledTimes(1);
    expect(plugin2).toHaveBeenCalledTimes(1);
    expect(plugin3).toHaveBeenCalledTimes(1);
  });

  it('loads an optional plugin in the correct phase', () => {
    const plugin1 = jest.fn(nextConfig => ({
      ...nextConfig,
      plugin1Config: 'foo',
    }));

    const plugin2 = jest.fn(nextConfig => ({
      ...nextConfig,
      plugin2Config: 'bar',
    }));

    const result = composePlugins(PHASE_DEVELOPMENT_SERVER, [
      [plugin1, [PHASE_DEVELOPMENT_SERVER]],
      [markOptional(() => plugin2), [PHASE_DEVELOPMENT_SERVER]],
    ], { initial: 'config' });

    expect(result).toEqual({
      initial: 'config',
      plugin1Config: 'foo',
      plugin2Config: 'bar',
    });

    expect(plugin1).toHaveBeenCalledTimes(1);
    expect(plugin2).toHaveBeenCalledTimes(1);
  });

  it('does not load an optional plugin in the wrong phase', () => {
    const plugin1 = jest.fn(nextConfig => ({
      ...nextConfig,
      plugin1Config: 'foo',
    }));

    const plugin2 = jest.fn(nextConfig => ({
      ...nextConfig,
      plugin2Config: 'bar',
    }));

    const result = composePlugins(PHASE_DEVELOPMENT_SERVER, [
      [plugin1, [PHASE_DEVELOPMENT_SERVER]],
      [markOptional(() => plugin2), [PHASE_PRODUCTION_SERVER]],
    ], { initial: 'config' });

    expect(result).toEqual({
      initial: 'config',
      plugin1Config: 'foo',
    });

    expect(plugin1).toHaveBeenCalledTimes(1);
    expect(plugin2).toHaveBeenCalledTimes(0);
  });

  it('handles objects as plugins', () => {
    const plugin = {
      plugin1Config: 'foo',
    };

    const result = composePlugins(PHASE_DEVELOPMENT_SERVER, [plugin], { initial: 'config' });

    expect(result).toEqual({
      initial: 'config',
      plugin1Config: 'foo',
    });
  });

  it('throws an error for incompatible plugins', () => {
    const plugin = ['something', 'weird'];

    expect(() => composePlugins(PHASE_DEVELOPMENT_SERVER, [plugin], {})).toThrowError('Incompatible plugin');
  });
});
