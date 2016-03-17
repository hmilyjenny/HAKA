var webpack = require('webpack');
var path = require('path');

module.exports = {
  devtool:'source-map',
  entry :[
    "webpack-dev-server/client?http://localhost:3000",
    "webpack/hot/only-dev-server",
    path.resolve(__dirname, 'client/src/index.js')
  ],
  output:{
    path:path.resolve(__dirname, 'build'),
    filename:"js/bundle.js"
  },
  module:{
    preLoaders: [
      {
        test: /\.jsx?$/,
        loaders: process.env.NODE_ENV === 'production' ? [] : ['eslint'],
        include: path.resolve(ROOT_PATH, 'client')
      }
    ],
    loaders:[
      {
        test: /\.js$/, // Transform all .js files required somewhere within an entry point...
         loader: 'babel', // ...with the specified loaders...
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
  plugins:[
    new webpack.HotModuleReplacementPlugin()
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
