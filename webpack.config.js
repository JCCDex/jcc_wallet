const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const path = require("path");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const pkg = require("./package.json");

const config = {
  entry: "./src/index.ts",
  output: {
    filename: "jcc-wallet." + pkg.version + ".js",
    path: path.resolve(__dirname, "./dist"),
    library: "jcc_wallet",
    libraryTarget: "umd"
  },
  target: "web",
  resolve: {
    extensions: [".js", ".ts"],
    alias: {
      "bn.js": path.resolve(__dirname, "node_modules/jcc_jingtum_base_lib/node_modules/bn.js"),
      "keccak": path.resolve(__dirname, "node_modules/keccak"),
      "hash.js": path.resolve(__dirname, "node_modules/hash.js"),
      "base64-js": path.resolve(__dirname, "node_modules/base64-js"),
      "elliptic": path.resolve(__dirname, "node_modules/jcc_jingtum_base_lib/node_modules/elliptic/")
    }
  },
  mode: process.env.MODE === "dev" ? 'development' : "production",
  node: {
    fs: "empty",
    tls: "empty",
    "child_process": "empty",
    net: "empty"
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: "ts-loader",
      exclude: /node_modules/
    }]
  },
  plugins: [
    new DuplicatePackageCheckerPlugin()
  ]
};

if (process.env.REPORT === "true") {
  config.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = config;