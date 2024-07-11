const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const path = require("path");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const config = {
  entry: "./lib",
  output: {
    filename: "jcc-wallet.min.js",
    path: path.resolve(__dirname, "./dist"),
    library: "jcc_wallet",
    libraryTarget: "umd"
  },
  target: "web",
  resolve: {
    extensions: [".js", ".ts"],
    alias: {
      "bn.js": path.resolve(__dirname, "node_modules/bn.js"),
      "base-x": path.resolve(__dirname, "node_modules/base-x")
    },
    fallback: {
      tls: false,
      net: false,
      fs: false,
      child_process: false
    }
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false
      })
    ]
  },
  mode: process.env.MODE === "dev" ? "development" : "production",
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: "ts-loader"
      },
      {
        test: /\.(cjs|mjs|js|jsx)$/,
        loader: "babel-loader"
      }
    ]
  },
  plugins: [
    new DuplicatePackageCheckerPlugin(),
    new NodePolyfillPlugin({
      excludeAliases: ["process", "console", "crypto"]
    })
  ]
};

if (process.env.REPORT === "true") {
  config.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = config;
