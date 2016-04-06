import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const tbLogsSchema = new Schema({
    cuid: {type: 'String', required: true},
    userName: {type: 'String', required: true},
    clientIP: {type: 'String', required: true},
    handleResult: {type: 'String', default: 'success', required: true},
    handleModule: {type: 'String', required: false},
    handleHostModule: {type: 'String', required: false},
    sendResult: {type: 'String', required: false},
    handleDate: {type: 'Date', default: Date.now, required: true},
    handleSpan: {type: 'String', required: false},
});

tbLogsSchema.index({ cuid: 1 });
tbLogsSchema.index({ userName: 1 });
tbLogsSchema.index({ handleResult: 1 });

export default mongoose.model('Tb_Logs', tbLogsSchema);