import {Router} from 'express';
import * as filesController from '../controllers/files.controller';
import * as tokenManager from '../controllers/token.controller';
const fileRouter = new Router();

fileRouter.route('/file/upload').post(tokenManager.verifyToken, filesController.fileUpload);
fileRouter.route('/file/remove').post(tokenManager.verifyToken).post(filesController.fileRemove);
fileRouter.route('/file/getfilesdata').post(tokenManager.verifyToken).post(filesController.fileShowData);
fileRouter.route('/file/showfile').post(tokenManager.verifyToken).post(filesController.fileShowFile);

export default fileRouter;