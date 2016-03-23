import {Router} from 'express';
import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import * as UserObj from '../controllers/user.passport.controller';

const userPassportRouter = new Router();

/*用户名或密码都不能为空，否则会报fashManage的错误*/

passport.use(new LocalStrategy(
  function(username, password, cb) {
    UserObj.userSignIn(username, password, function(err, user) {
      if (err) {
        return cb(err);
      }
      if (!user) {
        return cb(null, false);
      }
      return cb(null, user);
    });
  }));

userPassportRouter.route('/userSignIn/passport').post(
  passport.authenticate('local', {
    session: false,
    failureFlash: true
  }),
  function(req, res) {
    res.json({
      user: {
        token: req.user.token,
        username: req.user.username
      }
    });
  });

/*userPassportRouter.route('/userSignIn/QQ/passport').post(UserController.userSignIn);
userPassportRouter.route('/userSignIn/WEIXIN/passport').post(UserController.userSignIn);
userPassportRouter.route('/userSignIn/WEIBO/passport').post(UserController.userSignIn);*/

export default userPassportRouter;