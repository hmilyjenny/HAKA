import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const tbUserSchema = new Schema({
    userName: {type: 'String', unique: true, required: true },
    userPassword: {type: 'String', required: true },
    userEmail: {type: 'String', required: false},
    userTel: {type: 'String', required: false },
    isLogin: {type: 'Boolean', default: false, required: true},
    loginedTime: {type: 'Date', required: false },
    logoutedTime: {type: 'Date', required: false },
    loginType: {type: 'String', default: 'WEBSITE', required: false },
    createTime: {type: 'Date', default: Date.now, required: true },
    userRole: {type: 'String', default: 'normal', required:  },
    cuid:{type: 'String', unique: true, required: true}
});

tbUserSchema.index({ userName: 1, cuid: 1 }, {unique: true});

export default mongoose.model('Tb_User', tbUserSchema);