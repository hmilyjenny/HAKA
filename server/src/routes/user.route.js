import {Router} from 'express';
import * as UserController from '../controllers/user.controller';
import * as tokenManager from '../controllers/token.controller';

const userRouter = new Router();

userRouter.route('/userSignIn').post(UserController.userSignIn);
userRouter.route('/userLogOut').post(UserController.userLogOut);
userRouter.route('/userSignIn/QQ').post(UserController.userSignIn);
userRouter.route('/userSignIn/WEIXIN').post(UserController.userSignIn);
userRouter.route('/userSignIn/WEIBO').post(UserController.userSignIn);
userRouter.route('/userRegister').post(UserController.userRegister);
userRouter.route('/refreshtoken').post(tokenManager.RefreshToken);

export default userRouter;