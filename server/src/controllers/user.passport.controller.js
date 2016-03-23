import Tb_User from '../models/databaseModels/tb_User';
import Tb_UserToken from '../models/databaseModels/tb_UserToken';
import sanitizeHtml from 'sanitize-html';
import md5 from 'md5';
import cuid from 'cuid';
import {
    auth as authConfig
}
from '../config/ServerConfig';

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
        let usertoken = new Tb_UserToken();
        Tb_UserToken.findOne({
            token: data.cuid
        }).count().exec((err, count) => {
            if (count === 0) {
                tmpcuid = cuid();
                Tb_User.update({
                    _id: data._id
                }, {
                    cuid: tmpcuid
                }, (uerr) => {
                    if (uerr) {
                        return cb(new Error('userSignIn-Tb_User-update:' + uerr));
                    }
                    usertoken.token = tmpcuid;
                    usertoken.createTime = Date.now();
                    usertoken.save((serr) => {
                        if (serr) {
                            return cb(new Error('userSignIn-Tb_UserToken-save:' + serr));
                        }
                    });
                });
            }
        });
        Tb_User.findOne(query, '-_id userName cuid').exec((err, newuser) => {
            if (err) {
                return cb(new Error('userSignIn-findOne:' + err));
            }
            return cb(null, {
                "token": tmpcuid == null ? newuser.cuid : tmpcuid,
                "username": newuser.userName
            });
        });
    });
}