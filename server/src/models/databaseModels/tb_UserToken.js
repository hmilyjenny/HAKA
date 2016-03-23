import mongoose from 'mongoose';
import {config as serverConfig} from '../../config/ServerConfig';

const Schema = mongoose.Schema;

const tbUserTokenSchema = new Schema({
    token: {type: 'String', unique: true, required: true },
    createTime: {type: 'Date', default: Date.now, required: true }
});

tbUserTokenSchema.index({ createTime: 1 }, {expireAfterSeconds: serverConfig.expireAfterSeconds});

export default mongoose.model('Tb_UserToken', tbUserTokenSchema);