const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const TerserPlugin = require("terser-webpack-plugin");

const config = {
  entry: "./src",
  output: {
    filename: "jcc-wallet.min.js",
    path: path.resolve(__dirname, "./dist"),
    library: "jcc_wallet",
    libraryTarget: "umd"
  },
  target: "web",
  resolve: {
    extensions: [".js", ".ts"],
    fallback: {
      tls: false,
      net: false,
      fs: false,
      child_process: false,
      buffer: require.resolve("buffer/")
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
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"]
    })
  ]
};

if (process.env.REPORT === "true") {
  config.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = config;
