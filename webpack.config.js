const path = require('path');

module.exports = {
  entry: './src/public-api.ts',
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'script.js',
    path: path.resolve(__dirname, 'dist')
  }
};