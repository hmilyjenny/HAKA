import {Router} from 'express';
import * as UserController from '../controllers/user.controller';
const userRouter = new Router();

userRouter.route('/userSignIn').post(UserController.userSignIn);
userRouter.route('/userLogOut').post(UserController.userLogOut);
userRouter.route('/userSignIn/QQ').post(UserController.userSignIn);
userRouter.route('/userSignIn/WEIXIN').post(UserController.userSignIn);
userRouter.route('/userSignIn/WEIBO').post(UserController.userSignIn);
userRouter.route('/userRegister').post(UserController.userRegister);

export default userRouter;