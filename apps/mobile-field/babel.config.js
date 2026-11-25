// NativeWind v4 (DESIGN_TOKENS.md §9.5): JSX import source + babel plugin.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
  };
};
