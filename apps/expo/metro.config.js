/* eslint-disable unicorn/prefer-module */
/* eslint-disable eslint-plugin-node/no-path-concat */
// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require("expo/metro-config");
const { FileStore } = require("metro-cache");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.cacheStores = [
  new FileStore({
    root: `${__dirname}/node_modules/.cache/metro`,
  }),
];

/** @type {import('expo/metro-config').MetroConfig} */
module.exports = withNativewind(config);
