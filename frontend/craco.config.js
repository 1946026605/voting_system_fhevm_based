const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          buffer: require.resolve("buffer/"),
          stream: require.resolve("stream-browserify"),
          crypto: require.resolve("crypto-browserify"),
          global: require.resolve("global"),
        },
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
        global: "global",
      }),
      new webpack.DefinePlugin({
        global: "globalThis",
      }),
    ],
  },
};
