import Express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';
import socketIO from 'socket.io';

import webpack from 'webpack';
import config from '../../webpack.dev.config';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

//初始化Express
const app = new Express();

// if (process.env.NODE_ENV !== 'production') {
//   const compiler = webpack(config);
//   app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath,hot: true,historyApiFallback: true,inline: false}));
//   app.use(webpackHotMiddleware(compiler));
// }

import serverConfig from './config/ServerConfig';
console.log("test");

// MongoDB Connection
// mongoose.connect(serverConfig.db, (error) => {
//   if (error) {
//     console.error('Please make sure Mongodb is installed and running!'); // eslint-disable-line no-console
//     throw error;
//   }
// });

app.use(Express.static(path.resolve(__dirname, '../../static')));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }));
app.use(bodyParser.json());

/**
 * API Endpoints
 */
//app.use('/api', auth);

app.get('/favicon.ico', (req, res) => res.sendFile(path.join(__dirname, '../../static/img', 'favicon.ico')));

// start app
app.listen(serverConfig.port, (error) => {
  if (!error) {
    console.log(`Haka is running on port: ${serverConfig.port}! Build something amazing!`); // eslint-disable-line
  }
});
