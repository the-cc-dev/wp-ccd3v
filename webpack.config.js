
const webpack = require('webpack');
const path = require('path');

module.exports = {
    
    entry: "./assets/js/main.js",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'my-first-webpack.bundle.js'
    },
    module: {
        rules: [
            { test: /\.txt$/, use: 'raw-loader'}
        ]
    }
};

module.exports = config;