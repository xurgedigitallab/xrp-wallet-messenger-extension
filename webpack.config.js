const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { merge } = require('webpack-merge');
const CopyPlugin = require('copy-webpack-plugin');

const commonConfig = {
  entry: {
    background: './background.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
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
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: '.' },
        { from: 'config.json', to: '.', noErrorOnMissing: false },
        { 
          from: 'icons', 
          to: 'icons',
          globOptions: {
            ignore: ['**/orig_button_icon.svg']  // Exclude the large SVG file
          }
        },
        { from: '_locales', to: '_locales' },
        { from: '*.html', to: '.', noErrorOnMissing: true },
        { from: '*.gif', to: '.', noErrorOnMissing: true },
        { from: '*.css', to: '.', noErrorOnMissing: true },
        { from: '*.png', to: '.', noErrorOnMissing: true },
        { from: 'content.min.js', to: '.', noErrorOnMissing: true },
        { from: 'options.min.js', to: '.', noErrorOnMissing: true },
      ],
    }),
  ],
  target: 'web',
  resolve: {
    fallback: {
      fs: false,
      path: false,
      crypto: false,
    },
  },
  performance: {
    hints: 'warning',
    maxAssetSize: 1024 * 1024, // 1 MiB
    maxEntrypointSize: 1024 * 1024, // 1 MiB
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
            drop_console: false,
            drop_debugger: true,
          },
          mangle: true,
          output: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
};

const developmentConfig = {
  mode: 'development',
  devtool: 'inline-source-map',
};

module.exports = (env) =>
  env.production
    ? merge(commonConfig, productionConfig)
    : merge(commonConfig, developmentConfig);