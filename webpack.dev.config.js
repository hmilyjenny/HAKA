var webpack = require('webpack');
var path = require('path');
var HtmlwebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool:'source-map',
  entry: ['webpack-hot-middleware/client',
          path.resolve(__dirname, 'client/src/index'),
  ],
  output:{
    path:path.resolve(__dirname, 'build'),
    filename:"bundle.js"
  },
  module:{
    loaders:[
      {
        test: /\.jsx?$/,
        loaders: ['react-hot', 'babel'],
         exclude: path.join(__dirname, '/node_modules/')
      },
      {
        test: /\.css$/,
        loaders:['style-loader','css-loader','postcss-loader']
      },
      {
        test: /\.jpe?g$|\.gif$|\.png$/i,
        loader: "url-loader"
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx','.css']
  },
  plugins:[
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        CLIENT: JSON.stringify(true)
      }
    }),
    new HtmlwebpackPlugin({
      title: 'HAKA'
    })
  ],
  target : "web",
  stats : false,
  progress : true,
  postcss: function(){
    return[
      require('postcss-import')({
        addDependencyTo: webpack
        }
      ),
      require('postcss-simple-vars')(),
      require('postcss-focus')(),
      require('autoprefixer')({
        browsers: ['last 2 versions', 'IE > 8']
      }),
      require('postcss-reporter')({
        clearMessages:true
      })
    ];
  }
}
