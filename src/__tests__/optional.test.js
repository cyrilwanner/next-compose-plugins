import 'jest';
import { markOptional, isOptional, resolveOptionalPlugin, OPTIONAL_SYMBOL } from '../optional';

describe('next-compose-plugins/optional', () => {
  /**
   * markOptional
   *
   * -------------------------------------
   */
  it('marks a plugin as optional', () => {
    const plugin = jest.fn(() => 'my-plugin');

    markOptional(plugin);

    expect(plugin[OPTIONAL_SYMBOL]).toEqual(true);
    expect(plugin).not.toHaveBeenCalled();
  });

  /**
   * isOptional
   *
   * -----------------------------------------
   */
  it('checks if a plugin is optional', () => {
    const plugin = jest.fn(() => 'my-plugin');

    expect(isOptional(plugin)).toEqual(false);

    markOptional(plugin);

    expect(isOptional(plugin)).toEqual(true);
    expect(plugin).not.toHaveBeenCalled();
  });

  /**
   * resolveOptionalPlugin
   *
   * --------------------------------------
   */
  it('resolves an optional plugin', () => {
    const plugin = jest.fn(() => 'my-plugin');

    expect(plugin).not.toHaveBeenCalled();
    expect(resolveOptionalPlugin(plugin)).toEqual('my-plugin');
    expect(plugin).toHaveBeenCalledTimes(1);
  });
});
