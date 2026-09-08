/* eslint-disable unicorn/prefer-module */
/* eslint-disable eslint-plugin-node/no-path-concat */
// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require("expo/metro-config");
// metro-cache is not a direct dependency; @expo/metro re-exports it so the
// import resolves under pnpm's isolated node_modules.
const { FileStore } = require("@expo/metro/metro-cache");
const { withUniwindConfig } = require("uniwind/metro");

const config = getDefaultConfig(__dirname);

config.cacheStores = [
  new FileStore({
    root: `${__dirname}/node_modules/.cache/metro`,
  }),
];

/** @type {import('expo/metro-config').MetroConfig} */
module.exports = withUniwindConfig(config, {
  cssEntryFile: "./src/styles.css",
});
