import Tb_Logs from '../models/databaseModels/tb_Logs';

export function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
}

export function logSaveToDB(result, cb) {
    let logObj = new Tb_Logs();
    logObj.cuid = result.cuid;
    logObj.userName = result.userName;
    logObj.clientIP = result.clientIP;
    logObj.handleResult = result.handleResult;
    logObj.handleModule = result.handleModule;
    logObj.handleHostModule = result.handleHostModule;
    logObj.sendResult = result.sendResult;
    logObj.handleDate = Date.now();
    logObj.handleSpan = result.handleSpan;
    logObj.save((err, saved) => {
        if (err) {
            return cb(new Error(err));
        }
        return cb(null, "success");
    });
}

/*
 * query:查询条件
 * pageNum:当前第几页-0为不分页
 * pageSize:返回查询信息数量-0为不分页
 */
export function logQuery(query, pageNum, pageSize, cb) {
    let queryCon = Tb_Logs.find({});
    if (query.userName) {
        queryCon = queryCon.where("userName", "/" + query.userName + "/");
    }
    if (query.clientIP) {
        queryCon = queryCon.where("clientIP", "/" + query.clientIP + "/");
    }
    if (query.handleResult) {
        queryCon = queryCon.where("handleResult", "/" + query.handleResult + "/");
    }
    if (query.handleModule) {
        queryCon = queryCon.where("handleModule", "/" + query.handleModule + "/");
    }
    if (query.handleHostModule) {
        queryCon = queryCon.where("handleHostModule", "/" + query.handleHostModule + "/");
    }
    if (query.sendResult) {
        queryCon = queryCon.where("sendResult", "/" + query.sendResult + "/");
    }
    if (query.handleDateBegin) {
        queryCon = queryCon.where("handleDate").gte(query.handleDateBegin);
    }
    if (query.handleDateEnd) {
        queryCon = queryCon.where("handleDate").lte(query.handleDateEnd);
    }
    if (query.handleSpan) {
        queryCon = queryCon.where("handleDate").gte(query.handleSpan);
    }
    let totalNum = null;
    let infoAll = null;
    let result = {};
    queryCon.count((err, count) => {
        if (err) {
            cb(new Error(err));
        } else {
            totalNum = count;
        }
    });
    queryCon.skip((pageNum - 1) * pageSize);
    if (pageNum > 0 && pageSize > 0) {
        queryCon.limit(pageSize);
    }
    queryCon.exec((err, data) => {
        if (err) {
            cb(new Error(err));
        } else {
            if (data) {
                infoAll = data;
            } else {
                infoAll = "当前无数据";
            }
        }
    })
    result.totalCount = totalNum;
    result.currentPage = 1;
    result.PageSize = totalNum;
    result.dataInfo = infoAll;
    cb(null, result);
}