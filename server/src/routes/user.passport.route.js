import {Router} from 'express';
import passport from 'passport';
import * as UserObj from '../controllers/user.passport.controller';
import * as tokenManager from '../controllers/token.controller';

const userPassportRouter = new Router();

/*
 * 用户名或密码都不能为空，否则会报fashManage的错误
 * TypeError: req.flash is not a function
 */
userPassportRouter.route('/userSignIn/passport').post(
  passport.authenticate('local', {
    session: false,
    failureFlash: true
  }),
  function(req, res) {
    res.json({
      token: req.user.token
    });
  });

userPassportRouter.route('/refreshtoken').post(tokenManager.RefreshToken);
/*userPassportRouter.route('/userSignIn/QQ/passport').post(UserController.userSignIn);
userPassportRouter.route('/userSignIn/WEIXIN/passport').post(UserController.userSignIn);
userPassportRouter.route('/userSignIn/WEIBO/passport').post(UserController.userSignIn);*/

export default userPassportRouter;