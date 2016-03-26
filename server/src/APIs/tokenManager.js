import Tb_UserToken from '../models/databaseModels/tb_UserToken';
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
    } catch (e) {
        return cb(new Error('Token无效'));
    }
    return cb(null, userInfo.payload);
}

export function saveToken(data, cb) {
    let newtoken = new Tb_UserToken();
    newtoken.cuid = data.cuid;
    newtoken.token = data.token;
    newtoken.createTime = Date.now();
    newtoken.save((err) => {
        if (err) {
            let queryObj = {
                cuid: data.cuid
            };
            let updateObj = {
                token: data.token,
                createTime: Date.now()
            };
            Tb_UserToken.update(queryObj, updateObj, (uerr) => {
                if (uerr) {
                    return cb(new Error('Token保存失败:' + uerr));
                } else {
                    return cb(null, "success");
                }
            });
        } else {
            return cb(null, "success");
        }
    });
}

export function verifyToken(req, res, next) {
    let token = null;
    try {
        token = getToken(req.headers);
    } catch (e) {
        res.status(403).send(e);
    }
    Tb_UserToken.findOne({
        token: token
    }).exec((err, data) => {
        if (!data || err) {
            res.status(401).send("Token验证失败" + err ? err : "");
        } else {
            next();
        }
    });
};

export function expireToken(headers, cb) {
    let token = null;
    try {
        token = getToken(headers);
    } catch (e) {
        return cb(new Error(e));
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
};

function getToken(headers) {
    if (!headers || !headers.authorization) {
        throw new Error('Token未找到');
    } else {
        return headers.authorization;
    }
};