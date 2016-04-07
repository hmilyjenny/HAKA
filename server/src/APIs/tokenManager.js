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
        return cb(new Error(e.message), 412);
    }
    let returnStr = "-_id userName cuid";
    Tb_UserToken.findOne({
        token: token
    }, returnStr).exec((err, data) => {
        if (err) {
            return cb(new Error("Token验证失败:" + err.message), 500);
        } else {
            if (!data) {
                decodeToken(token, (err, result) => {
                    if (err) {
                        return cb(new Error(err.message), 401);
                    } else {
                        let returnObj = {};
                        returnObj.cuid = result.userid;
                        returnObj.userName = result.username;
                        returnObj.role = result.role;
                        return cb(null, 401, returnObj);
                        next();
                    }
                })
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
        return cb(new Error(e), 412);
    }
    Tb_UserToken.findOneAndRemove({
        token: token
    }).exec((err) => {
        if (err) {
            return cb(new Error('移除Token出现问题：' + err), 500);
        } else {
            return cb(null, 200, null);
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

export function RefreshToken(token, cb) {
    decodeToken(token, (err1, result) => {
        if (err1) {
            return cb(new Error(err1), 401);
        }
        token = null;
        CreateToken(result.username, result.userid, result.role, (err2, token) => {
            if (err2) {
                return cb(new Error(err2), 500);
            }
            saveToken({
                token: token,
                cuid: result.userid
            }, (err3) => {
                if (err3) {
                    return cb(new Error(err3), 500);
                } else {
                    return cb(null, 200, token);
                }
            })
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