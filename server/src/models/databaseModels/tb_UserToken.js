import mongoose from 'mongoose';
import dbConfig from '../../config/DatabaseConfig';

const Schema = mongoose.Schema;

const tbUserTokenSchema = new Schema({
    cuid: {type: 'String', unique: true, required: true },
    token: {type: 'String', required: true },
    createTime: {type: 'Date', default: Date.now, required: true }
});

tbUserTokenSchema.index({ createTime: 1 }, {expireAfterSeconds: dbConfig.expireAfterSeconds});

export default mongoose.model('Tb_UserToken', tbUserTokenSchema);