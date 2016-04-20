import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const tbFilesSchema = new Schema({
    cuid: {type: 'String', required: true },
    fileType:{type:'String', required: true},
    clientName: {type: 'String', required: true },
    hostSourceFile: {type: 'String', required: true},
    hostDatFile: {type: 'String', required: false },
    hostJsonFile: {type: 'String', required: false},
    used: {type:'Boolean', default: false, required: true},
    projectName: {type: 'String', required: false},
    createTime: {type: 'Date', default: Date.now, required: true }
});

tbFilesSchema.index({ cuid: 1 });
tbFilesSchema.index({ clientName: 1 });

export default mongoose.model('Tb_Files', tbFilesSchema);