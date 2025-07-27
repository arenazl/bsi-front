const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              jsx: 'react'
            }
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx']
  }
};
