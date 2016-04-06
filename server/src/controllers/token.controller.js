import * as tokenManager from '../APIs/tokenManager';
import * as logManager from '../APIs/logManager';

export function verifyToken(req, res, next) {
    // let beginTime = Date.now();
    // let logObj = {};
    // logObj.cuid = "unknown";
    // logObj.userName = "unknown";
    // logObj.clientIP = logManager.getClientIp(req);
    // logObj.handleResult = "unknow";
    // logObj.handleModule = "token验证";
    // logObj.handleHostModule = "token.controllers";
    // logObj.sendResult = "unknow";
    // logObj.handleDate = Date.now();
    // logObj.handleSpan = 0;
    tokenManager.verifyToken(req.headers, (err, code, result) => {
        if (err) {
            res.status(code).send(err.message);
            // logObj.handleResult = "failed";
            // logObj.sendResult = err.message;
            // logObj.handleSpan = Date.now() - beginTime;
            // logManager.logSaveToDB(logObj, (err, data) => {
            //     if (err) console.log(err.message)
            // });
        } else {
            req.headers.userinfo = result;
            // logObj.cuid = result.cuid;
            // logObj.userName = result.userName;
            // logObj.handleResult = "success";
            // logObj.sendResult = result;
            // logObj.handleSpan = Date.now() - beginTime;
            // logManager.logSaveToDB(logObj, (err, data) => {
            //     if (err) console.log(err.message)
            // });
            next();
        }
    })
}