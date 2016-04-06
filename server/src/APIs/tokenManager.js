import Tb_User from '../models/databaseModels/tb_User';
import Tb_UserToken from '../models/databaseModels/tb_UserToken';
import serverConfig from '../config/ServerConfig';
import jwt from 'jsonwebtoken';

// token验证中间件
export function decodeToken(token, cb) {
    if (!token) {
        return cb(new Error('Token不能为空'));
    }
    let userInfo = null;
    try {
        userInfo = jwt.decode(token, {
            complete: true
        });
        if (!userInfo) {
            throw new Error('');
        }
    } catch (e) {
        return cb(new Error('Token无效'));
    }
    return cb(null, userInfo.payload);
}

export function saveToken(data, cb) {
    let queryCon = {
        cuid: data.cuid
    };
    let updateCon = {
        cuid: data.cuid,
        token: data.token,
        createTime: Date.now()
    }
    Tb_UserToken.findOneAndUpdate(queryCon, updateCon, {
        upsert: true
    }, (err) => {
        if (err) {
            return cb(new Error('Token保存失败:' + err.message));
        } else {
            return cb(null, "success");
        }
    });
}

export function verifyToken(headers, cb) {
    let token = null;
    try {
        token = getToken(headers);
    } catch (e) {
        return cb(new Error(e.message), 403);
    }
    let returnStr = "-_id userName cuid";
    Tb_UserToken.findOne({
        token: token
    }, returnStr).exec((err, data) => {
        if (err) {
            return cb(new Error("Token验证失败:" + err.message), 401);
        } else {
            if (!data) {
                RefreshToken(token, (rerr, newToken) => {
                    if (rerr) {
                        return cb(new Error("Token刷新失败:" + rerr.message), 500);
                    }
                    decodeToken(token, (derr, result) => {
                        if (derr) {
                            return cb(new Error("Token解码失败:" + derr.message), 500);
                        }
                        let returnObj = {};
                        returnObj.newToken = newToken;
                        returnObj.cuid = result.userid;
                        returnObj.userName = result.username;
                        return cb(null, null, returnObj);
                        next();
                    });
                });
            } else {
                Tb_User.findOne({
                    cuid: data.cuid
                }, returnStr).exec((uerr, udata) => {
                    if (!udata || uerr) {
                        return cb(new Error("根据Token获取用户信息失败" + (uerr ? uerr.message : "")), 500);
                    } else {
                        return cb(null, null, udata);
                        next();
                    }
                });
            }
        }
    });
}

export function expireToken(headers, cb) {
    let token = null;
    try {
        token = getToken(headers);
    } catch (e) {
        return cb(new Error(e.message));
    }
    Tb_UserToken.findOneAndRemove({
        token: token
    }).exec((err) => {
        if (err) {
            return cb(new Error('移除Token出现问题：' + err));
        } else {
            return cb(null, null);
        }
    });
}

export function CreateToken(username, cuid, role, cb) {
    let token = null;
    try {
        token = jwt.sign({
            username: username,
            userid: cuid,
            role: role
        }, serverConfig.secretKEY, {
            expiresIn: serverConfig.expireInTime
        });
        return cb(null, token);
    } catch (e) {
        return cb(new Error(e.message));
    }
}

function RefreshToken(token, cb) {
    decodeToken(token, (err1, result) => {
        if (err1) {
            return cb(new Error(err1.message), 500);
        }
        let token = null;
        CreateToken(result.username, result.userid, result.userRole, (err, token) => {

        })
        saveToken({
            token: token,
            cuid: result.userid
        }, (err2) => {
            if (err2) {
                return cb(new Error(err2.message), 500);
            } else {
                return cb(null, token);
            }
        })
    })
}

function getToken(headers) {
    if (!headers || !headers.authorization) {
        throw new Error('Token未找到');
    } else {
        return headers.authorization;
    }
};