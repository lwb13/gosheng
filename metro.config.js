// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 支持 .env 文件
config.resolver.sourceExts = [...config.resolver.sourceExts, 'env'];

module.exports = config;
