import {Router} from 'express';
import * as filesController from '../controllers/files.controller';
import * as tokenManager from '../controllers/token.controller';
const fileRouter = new Router();

fileRouter.route('/file/upload').post(tokenManager.verifyToken, filesController.fileUpload);
fileRouter.route('/file/remove').post(tokenManager.verifyToken, filesController.fileRemove);
fileRouter.route('/file/getfilesdata').post(tokenManager.verifyToken, filesController.fileShowData);
fileRouter.route('/file/downloadfile').post(tokenManager.verifyToken, filesController.fileShowFile);
fileRouter.route('/file/showfile/:cuid/:filename/:filetype').get(filesController.fileLoadFile);

export default fileRouter;