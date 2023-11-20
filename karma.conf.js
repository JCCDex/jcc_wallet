const webpackConfig = require("./webpack.config");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const webpack = require("webpack");
module.exports = function(config) {
  config.set({
    frameworks: ["browserify", "detectBrowsers", "mocha"],
    files: ["test/*.spec.js"],
    flags: ["--no-sandbox"],
    preprocessors: {
      // don't use browserify, because it don't support dynamic require.
      // and some file is dynamic required in the `stm-lib` package.
      "test/*.spec.js": ["webpack"]
    },
    singleRun: true,
    client: {
      mocha: {
        timeout: 30000 // 6 seconds - upped from 2 seconds
      }
    },
    plugins: [
      "karma-webpack",
      "karma-browserify",
      "karma-chrome-launcher",
      "karma-env-preprocessor",
      "karma-firefox-launcher",
      "karma-detect-browsers",
      "karma-mocha"
    ],
    webpack: {
      node: webpackConfig.node,
      resolve: webpackConfig.resolve,
      mode: "development",
      plugins: [
        new NodePolyfillPlugin(),
        new webpack.IgnorePlugin({
          resourceRegExp: /canvas/,
          contextRegExp: /jsdom$/
        })
      ]
    },
    envPreprocessor: ["RANDOM_TESTS_REPEAT"],
    detectBrowsers: {
      enabled: true,
      usePhantomJS: false,
      postDetection(availableBrowser) {
        if (availableBrowser.includes("Chrome")) {
          return ["ChromeHeadless"];
        }

        var browsers = ["Chrome", "Firefox"];
        return browsers.filter(function(browser) {
          return availableBrowser.indexOf(browser) !== -1;
        });
      }
    }
  });
};
