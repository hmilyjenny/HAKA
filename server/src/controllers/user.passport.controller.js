import Tb_User from '../models/databaseModels/tb_User';
import Tb_UserToken from '../models/databaseModels/tb_UserToken';
import sanitizeHtml from 'sanitize-html';
import md5 from 'md5';
import cuid from 'cuid';
import jwt from 'jsonwebtoken';
import serverConfig from '../config/ServerConfig';
import * as tokenManager from '../APIs/tokenManager';

export function userSignIn(username, password, cb) {
    let tmpcuid = null;
    let userinfo = new Tb_User();
    userinfo.userName = sanitizeHtml(username);
    userinfo.userPassword = md5(sanitizeHtml(password));
    let query = {
        "userName": userinfo.userName,
        "userPassword": userinfo.userPassword,
    };
    let update = {
        "isLogin": true,
        "loginedTime": Date.now(),
        "loginType": "WEBSITE"
    };

    Tb_User.findOneAndUpdate(query, update, (merr, data) => {
        if (merr) {
            return cb(new Error('userSignIn-findOneAndUpdate:' + merr));
        }
        if (!data) {
            return cb("用户名或密码错误");
        }
        let token = jwt.sign({
            username: data.userName,
            userid: data.cuid,
            role: data.userRole
        }, serverConfig.secretKEY, {
            expiresIn: serverConfig.expireInTime
        });
        tokenManager.saveToken({
            token: token,
            cuid: data.cuid
        }, (err) => {
            if (err) {
                return cb(new Error('tokenManager-saveToken:' + err));
            } else {
                return cb(null, {
                    token
                });
            }
        });
    });
}