// Jest (jest-expo) for the field unit app. pnpm keeps packages under node_modules/.pnpm/<name>/node_modules,
// so the transform allowlist must match through that prefix as well.
const transformed = [
  '(jest-)?react-native',
  '@react-native(-community)?',
  'expo(nent)?',
  '@expo(nent)?/.*',
  '@expo-google-fonts/.*',
  'expo-router',
  'react-navigation',
  '@react-navigation/.*',
  'nativewind',
  'react-native-css-interop',
  '@istigaba/.*',
].join('|');

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./test/setup.ts'],
  transformIgnorePatterns: [`node_modules/(?!(\\.pnpm/[^/]+/node_modules/)?(${transformed}))`],
};
