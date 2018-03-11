module.exports = ([ ...plugins ], nextConfig = {}) => {
  let config = { ...nextConfig };

  plugins.forEach((plugin) => {
    if (plugin instanceof Array) {
      const [ initPlugin, pluginConfig ] = plugin;
      config = initPlugin({ ...config, ...(pluginConfig || {}) });
    } else {
      config = plugin(config);
    }
  });

  return config;
};
