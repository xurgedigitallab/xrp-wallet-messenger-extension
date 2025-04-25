const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { merge } = require('webpack-merge');

const commonConfig = {
  entry: './background.js',
  output: {
    filename: 'background.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Clean the output directory before each build
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  target: 'web',
  resolve: {
    fallback: {
      fs: false,
      path: false,
      crypto: false,
    },
  },
};

const productionConfig = {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: false, // Keep console logs for debugging
            drop_debugger: true, // Remove debugger statements
          },
          mangle: true, // Shorten variable names
          output: {
            comments: false, // Remove comments
          },
        },
        extractComments: false, // Do not extract comments to a separate file
      }),
    ],
  },
};

const developmentConfig = {
  mode: 'development',
  devtool: 'inline-source-map', // For easier debugging in development
};

module.exports = (env) =>
  env.production
    ? merge(commonConfig, productionConfig)
    : merge(commonConfig, developmentConfig);