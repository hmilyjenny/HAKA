import Tb_User from '../models/databaseModels/tb_User';
import Tb_UserToken from '../models/databaseModels/tb_UserToken';
import sanitizeHtml from 'sanitize-html';
import md5 from 'md5';
import cuid from 'cuid';
import jwt from 'jsonwebtoken';
import serverConfig from '../config/ServerConfig';
import userConfig from '../config/UserConfig';
import * as tokenManager from '../APIs/tokenManager';

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
      return res.status(500).send('userSignIn-findOneAndUpdate:' + merr);
    }
    if (!data) {
      return res.status(401).send('用户名或密码错误');
    }
    let token = jwt.sign({
      username: data.userName,
      userid: data.cuid
    }, serverConfig.secretKEY, {
      expiresIn: serverConfig.expireInTime
    });
    tokenManager.saveToken({
      token: token,
      cuid: data.cuid
    }, (err) => {
      if (err) {
        return res.status(500).send('tokenManager-saveToken:' + err);
      } else {
        return res.json({
          token: token
        });
      }
    });
  });
}

export function userLogOut(req, res) {
  if (!req.headers || !req.headers.authorization) {
    return res.status(403).send('Reader req.headers failed.\r\nThe headers authorization field is request.');
  }
  tokenManager.decodeToken(req.headers.authorization, (err, data) => {
    if (err) {
      return res.status(401).send('Token无效');
    } else {
      let query = {
        userName: data.username,
        cuid: data.userid
      };
      let update = {
        "isLogin": false,
        "logoutedTime": Date.now(),
        "loginType": null
      };
      Tb_User.findOneAndUpdate(query, update, (merr, data) => {
        if (merr) {
          return res.status(500).send('userLogOut-findOneAndUpdate:' + merr);
        }
        if (!data) {
          return res.status(401).send('Token解析错误或当前用户信息无效');
        }
        tokenManager.expireToken(req.headers, (err) => {
          if (err) {
            return res.status(500).send('tokenManager-expireToken:' + err);
          } else {
            return res.status(200).send('success');
          }
        });
      });
    }
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
      return res.status(500).send('userSignUp:' + err);
    }
    return res.status(200).send('success');
  });
}

export function userSignInforQQ(req, res) {
  popsicle.request({
      method: 'POST',
      url: userConfig.qq.accessTokenUri,
      body: {
        response_type: 'token',
        client_id: userConfig.qq.clientID,
        redirect_uri: userConfig.qq.redirectUri,
        scope: userConfig.qq.scopes
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