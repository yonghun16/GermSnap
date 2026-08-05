const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// react-native-fast-tflite: allow bundling .tflite models as binary assets.
config.resolver.assetExts.push('tflite');

module.exports = config;
