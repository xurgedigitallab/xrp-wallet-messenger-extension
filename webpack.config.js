const path = require('path');

module.exports = {
    entry: './background.js',
    output: {
        filename: 'background.bundle.js',
        path: path.resolve(__dirname, 'dist')
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