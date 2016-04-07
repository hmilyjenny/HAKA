import Express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';
import socketIO from 'socket.io';
import log4js from 'log4js';

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

import initData from './initdata';
import serverConfig from './config/ServerConfig';
import dbConfig from './config/DatabaseConfig';

// MongoDB Connection
mongoose.connect(dbConfig.mongoURL, (error) => {
    if (error) {
        console.error('请确保Mongodb已安装并已运行!');
        throw error;
    }
    initData();
});

app.use(Express.static(path.resolve(__dirname, '../../static')));
app.use(bodyParser.urlencoded({
    limit: '20mb',
    extended: false
}));
app.use(bodyParser.json());

/*
 * log function
 */
log4js.configure({
    appenders: [{
        type: 'console',
        category: "console"
    }, {
        type: 'dateFile',
        filename: './logs/result_log',
        pattern: "_yyyy-MM-dd.log",
        maxLogSize: 20480,
        alwaysIncludePattern: true,
        category: 'normal'
    }],
    replaceConsole: true
});
let logger = log4js.getLogger('normal');
logger.setLevel('INFO');
app.use(log4js.connectLogger(logger, {
    level: log4js.levels.INFO
}));
import * as logManager from './APIs/logManager';
app.use(function(req, res, next) {
    let beginTime = Date.now();
    // 保存原始处理函数
    let _send = res.send;
    // 自己的日志处理方法
    res.send = function() {
        let logObj = {};
        let cuid = req.headers.userinfo ? req.headers.userinfo.cuid : null;
        let userName = req.headers.userinfo ? req.headers.userinfo.userName : null;
        logObj.cuid = cuid ? cuid : "unknown";
        logObj.userName = userName ? userName : "unknown";
        logObj.clientIP = logManager.getClientIp(req);
        logObj.handleModule = req.url ? req.url : "unknown";
        // logObj.handleModule = "token验证";
        // logObj.handleHostModule = "token.controllers";
        // logObj.sendResult = "unknow";
        logObj.handleResult = res.statusCode === 200 ? "success" : "failed";
        logObj.handleDate = Date.now();
        logObj.handleSpan = Date.now() - beginTime;
        logManager.logSaveToDB(logObj, (err, data) => {
            if (err) console.log(err.message)
        });
        res.set('RefreshToken', req.headers.RefreshToken ? true : false);
        // 控制权交回
        return _send.apply(res, arguments);
    };
    next();
});

/**
 * API Endpoints
 */
import userRoutes from './routes/user.route';
app.use(userRoutes);

/*
 * Passport function
 */
import passport from 'passport';
import passportUserRoutes from './routes/user.passport.route';
app.use(passport.initialize());
app.use(passportUserRoutes);

/*
 * files upload function
 */
import fileRouter from './routes/file.route';
//启用跨域资源共享
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    if ('OPTIONS' == req.method) {
        res.send(204);
    } else {
        next();
    }
});
app.use(fileRouter);

app.get('/favicon.ico', (req, res) => res.sendFile(path.join(__dirname, '../../static/img', 'favicon.ico')));

// start app
app.listen(serverConfig.port, (error) => {
    if (!error) {
        console.log(`Haka is running on port: ${serverConfig.port}! Build something amazing!`); // eslint-disable-line
    }
});