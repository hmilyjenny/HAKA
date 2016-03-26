import mongoose from 'mongoose';
import ms from 'ms';
import serverConfig from '../../config/ServerConfig';

const Schema = mongoose.Schema;

const tbUserTokenSchema = new Schema({
    cuid: {type: 'String', unique: true, required: true},
    token: {type: 'String', required: true},
    createTime: {type: 'Date', default: Date.now, required: true}
});

tbUserTokenSchema.index({createTime: 1}, {expireAfterSeconds: ms(serverConfig.expireInTime) / 1000});

export default mongoose.model('Tb_UserToken', tbUserTokenSchema);