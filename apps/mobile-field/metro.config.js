// Expo's default Metro config detects the pnpm monorepo (watch folders, node_modules lookup).
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

module.exports = withNativeWind(getDefaultConfig(__dirname), { input: './global.css' });
