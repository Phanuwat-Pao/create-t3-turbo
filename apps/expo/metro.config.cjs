// Learn more: https://docs.expo.dev/guides/monorepos/
// CommonJS (.cjs) so the config can use require and __dirname without lint
// suppressions.
const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

const config = getDefaultConfig(__dirname);

// No cacheStores here: withUniwindConfig replaces them with its own store in
// the OS temp dir, which skips caching the CSS entry so theme edits show up.
/** @type {import('expo/metro-config').MetroConfig} */
module.exports = withUniwindConfig(config, {
  cssEntryFile: "./src/styles.css",
});
