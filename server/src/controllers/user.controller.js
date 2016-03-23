import Tb_User from '../models/databaseModels/tb_User';
import Tb_UserToken from '../models/databaseModels/tb_UserToken';
import sanitizeHtml from 'sanitize-html';
import md5 from 'md5';
import cuid from 'cuid';
import {
  auth as authConfig
}
from '../config/ServerConfig';

/*登录数据上传格式
application/json
{
  "post": {
    "username": "administrator",
    "password": "lhzy1234561"
  }
}*/
export function userSignIn(req, res) {
  if (!req.body.post) {
    return res.status(403).send('Please using application/json type request.\r\nExample:{"post": {"username": "123","password": "123"}}');
  }
  if (!req.body.post.username || !req.body.post.password) {
    return res.status(403).send('username and password is required.');
  }
  let tmpcuid = null;
  let userinfo = new Tb_User();
  userinfo.userName = sanitizeHtml(req.body.post.username);
  userinfo.userPassword = md5(sanitizeHtml(req.body.post.password));
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
      return res.status(403).send('userSignIn-findOneAndUpdate:' + merr);
    }
    if (!data) {
      return res.status(500).send('用户名或密码错误');
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
            return res.status(403).send('userSignIn-Tb_User-update:' + uerr);
          }
          usertoken.token = tmpcuid;
          usertoken.createTime = Date.now();
          usertoken.save((serr) => {
            if (serr) {
              return res.status(403).send('userSignIn-Tb_UserToken-save:' + serr);
            }
          });
        });
      }
    });
    Tb_User.findOne(query, '-_id userName cuid').exec((err, newuser) => {
      if (err) {
        return res.status(403).send('userSignIn-findOne:' + err);
      }
      return res.json({
        user: {
          token: tmpcuid == null ? newuser.cuid : tmpcuid,
          username: newuser.userName
        }
      });
    });
  });
}

export function userLogOut(req, res) {
  if (!req.body.post) {
    return res.status(403).send('Please using application/json type request.\r\nExample:{"post": {"username": "123","token": "123"}}');
  }
  if (!req.body.post.username || !req.body.post.token) {
    return res.status(403).send('username and token is required.');
  }
  let userinfo = new Tb_User();
  userinfo.userName = sanitizeHtml(req.body.post.username);
  userinfo.cuid = sanitizeHtml(req.body.post.token);
  let query = {
    "userName": userinfo.userName,
    "cuid": userinfo.cuid,
  };
  let update = {
    "isLogin": false,
    "logoutedTime": Date.now(),
    "loginType": null
  };
  Tb_User.findOneAndUpdate(query, update, (merr, data) => {
    if (merr) {
      return res.status(403).send('userLogOut-findOneAndUpdate:' + merr);
    }
    if (!data) {
      return res.status(500).send('用户名或Token错误');
    }
    let usertoken = new Tb_UserToken();
    Tb_UserToken.remove({
      token: data.cuid
    }).exec();
    return res.status(200).send('success');
  });
}

export function userRegister(req, res) {
  if (!req.body.post) {
    return res.status(403).send('Please using application/json type request.\r\nExample:{"post": {"username": "123","password": "123".......}}');
  }
  if (!req.body.post.username || !req.body.post.password) {
    return res.status(403).send('username and password is required.');
  }
  let newUser = new Tb_User();
  newUser.userName = sanitizeHtml(req.body.post.username);
  newUser.userPassword = md5(sanitizeHtml(req.body.post.password));
  newUser.userEmail = sanitizeHtml(req.body.post.email);
  newUser.userTel = sanitizeHtml(req.body.post.tel);
  newUser.isLogin = false;
  newUser.loginedTime = null;
  newUser.logoutedTime = null;
  newUser.loginType = null;
  newUser.createTime = Date.now();
  newUser.cuid = cuid();

  newUser.save((err, saved) => {
    if (err) {
      return res.status(403).send('userSignUp:' + err);
    }
    return res.status(200).send('success');
  });
}

export function userSignInforQQ(req, res) {
  popsicle.request({
      method: 'POST',
      url: authConfig.qq.accessTokenUri,
      body: {
        response_type: 'token',
        client_id: authConfig.qq.clientID,
        redirect_uri: authConfig.qq.redirectUri,
        scope: authConfig.qq.scopes
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .then(function(res) {
      /*console.log(res.status) // => 200
      console.log(res.body) //=> { ... }
      console.log(res.get('Content-Type')) //=> 'application/json'*/
    })
}
export function userSignInforWEIXIN(req, res) {}
export function userSignInforWEIBO(req, res) {}