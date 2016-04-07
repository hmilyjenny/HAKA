import Tb_User from '../models/databaseModels/tb_User';
import Tb_UserToken from '../models/databaseModels/tb_UserToken';
import sanitizeHtml from 'sanitize-html';
import md5 from 'md5';
import cuid from 'cuid';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import serverConfig from '../config/ServerConfig';
import * as tokenManager from '../APIs/tokenManager';

passport.use(new LocalStrategy(
    function(username, password, cb) {
        userSignIn(username, password, function(err, user) {
            if (err) {
                return cb(err);
            }
            if (!user) {
                return cb(null, false);
            }
            return cb(null, user);
        });
    }));

export function userSignIn(username, password, cb) {
    let tmpcuid = null;
    let userinfo = new Tb_User();
    userinfo.userName = sanitizeHtml(username);
    userinfo.userPassword = md5(sanitizeHtml(password));
    let query = {
        $or: [{
            "userName": userinfo.userName
        }, {
            "userEmail": userinfo.userName
        }, {
            "userTel": userinfo.userName
        }],
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
        tokenManager.CreateToken(data.userName, data.cuid, data.userRole, (cerr, token) => {
            if (cerr) {
                return cb(new Error(cerr.message))
            }
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
        })
    });
}