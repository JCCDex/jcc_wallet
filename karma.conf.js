const webpackConfig = require("./webpack.config");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const webpack = require("webpack");
module.exports = function(config) {
  config.set({
    frameworks: ["browserify", "detectBrowsers", "mocha"],
    files: [
      "test/bvcadt.spec.js",
      "test/call.spec.js",
      "test/jingchang.wallet.spec.js",
      "test/hd.spec.js",
      "test/eth.spec.js",
      "test/jingtum.spec.js",
      "test/moac.spec.js",
      "test/ripple.spec.js",
      "test/stm.spec.js",
      "test/util.spec.js"
    ],
    preprocessors: {
      // don't use browserify, because it don't support dynamic require.
      // and some file is dynamic required in the `stm-lib` package.
      "test/*.spec.js": ["webpack"]
    },
    singleRun: true,
    browserDisconnectTimeout: 60000,
    browserDisconnectTolerance: 3,
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
