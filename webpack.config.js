const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: {
    gited: './src/js/gited.js'
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'www/js/')
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },

  plugins: [
    new webpack.ProgressPlugin(),
    new MiniCssExtractPlugin({
      filename: '../style/gited.css'
    })
  ],

  module: {
    rules: [
      {
        test: /.(js|jsx)$/,
        include: [path.resolve(__dirname, 'src/js')],
        loader: 'babel-loader'
      },
      {
        test: /\.scss$/,
        exclude: /(node_modules|bower_components)/,
        use: [{
          loader: MiniCssExtractPlugin.loader
        },
        {
          loader: 'css-loader'
        },
        {
          loader: 'sass-loader',
          options: {
            sourceMap: true
          }
        }]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          }]
      }
    ]
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          priority: -10,
          test: /[\\/]node_modules[\\/]/
        }
      },

      chunks: 'async',
      minChunks: 1,
      minSize: 30000,
      name: true
    }
  },

  devServer: {
    open: true
  }
}
