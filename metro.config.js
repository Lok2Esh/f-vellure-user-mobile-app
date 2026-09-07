const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("node:path");
const LimitedCacheStore = require("./scripts/metro-cache-store.cjs");

const config = getDefaultConfig(__dirname);

// Limit worker pools and cache I/O independently to avoid Windows EMFILE.
config.maxWorkers = 2;
config.cacheStores = ({ FileStore }) => [
  new LimitedCacheStore(new FileStore({
    root: path.join(__dirname, ".expo", "metro-transform-cache"),
  })),
];

module.exports = withNativeWind(config, { input: "./global.css" });
