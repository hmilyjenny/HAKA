import async from 'async';
import path from 'path';
import fs from 'fs';
import fsextra from 'fs-extra';
import formidable from 'formidable';
import mongoose from 'mongoose';
import cprocess from 'child_process';
import cuid from 'cuid';
import Tb_Files from '../models/databaseModels/tb_Files';
import serverConfig from '../config/ServerConfig';

const GridStore = mongoose.mongo.GridStore;
const ObjectID = mongoose.mongo.ObjectID;
const FSBucket = mongoose.mongo.GridFSBucket;

//使用二进制的方式将文件存储到mongodb
export function fileUploadToDB(userinfo, req, cb) {
    let form = new formidable.IncomingForm();
    let tempdir = serverConfig.tmpfileUploadUrl + userinfo.cuid + '/';
    form.multiples = true;
    form.keepExtensions = true;
    form.uploadDir = tempdir;
    form.maxFieldsSize = serverConfig.fileChunkSize * 1024 * 1024;
    //创建临时文件保存区
    if (fsextra.ensureDirSync(tempdir)) {
        console.log('创建上传临时文件夹成功:' + tempdir);
    }
    // 解析并保存文件块到默认路径
    form.parse(req, function(err, fields, files) {
        if (err) {
            return cb(new Error(err), 500);
        }
    });
    form.on('aborted', function(err) {
        if (err) {
            return cb(new Error(err), 500);
        }
    });
    form.on('error', function(err) {
        if (err) {
            return cb(new Error(err), 500);
        }
    });
    // 在文件保存到临时目录后，再转移到mongodb
    form.on('end', function(fields, files) {
        if (!this.openedFiles || this.openedFiles.length === 0) {
            return cb(new Error("未发现上传文件"), 404);
        }
        let resultFileObj = {
            successfiles: [],
            failedfiles: []
        };
        async.forEachOfSeries(this.openedFiles, (file, index, callback) => {
            let options = {
                content_type: file.type,
                metadata: {
                    "filetype": file.type
                }
            };
            let id = new ObjectID();
            putGridFileByPath(file.path, id, file.name, options, (err, result) => {
                if (err) {
                    let failedObj = {};
                    failedObj.clientfilename = file.name;
                    failedObj.error = err.message;
                    resultFileObj.failedfiles.push(failedObj);
                } else {
                    let fileObj = {};
                    fileObj.clientfilename = file.name;
                    fileObj.hostsourcefile = id;
                    resultFileObj.successfiles.push(fileObj);
                }
                fs.unlinkSync(file.path);
                callback();
            });
        }, function(err) {
            if (err) {
                return cb(new Error(err), 500);
            }
            return cb(null, 200, resultFileObj);
        });
    });
}
//通过GridFSBucket,使用二进制的方式将文件存储到mongodb
export function fileUploadToDB_GridFSBucket(userinfo,req,cb){
    let form = new formidable.IncomingForm();
    let tempdir = serverConfig.tmpfileUploadUrl + userinfo.cuid + '/';
    form.multiples = true;
    form.keepExtensions = true;
    form.uploadDir = tempdir;
    form.maxFieldsSize = serverConfig.fileChunkSize * 1024 * 1024;
    //创建临时文件保存区
    if (fsextra.ensureDirSync(tempdir)) {
        console.log('创建上传临时文件夹成功:' + tempdir);
    }
    // 解析并保存文件块到默认路径
    form.parse(req, function(err, fields, files) {
        if (err) {
            return cb(new Error(err), 500);
        }
    });
    form.on('aborted', function(err) {
        if (err) {
            return cb(new Error(err), 500);
        }
    });
    form.on('error', function(err) {
        if (err) {
            return cb(new Error(err), 500);
        }
    });
    // 在文件保存到临时目录后，再转移到mongodb
    form.on('end', function(fields, files) {
        if (!this.openedFiles || this.openedFiles.length === 0) {
            return cb(new Error("未发现上传文件"), 404);
        }
        let resultFileObj = {
            successfiles: [],
            failedfiles: []
        };
        let db = mongoose.connection.db;
        let store=new FSBucket(db);
        async.forEachOfSeries(this.openedFiles, (file, index, callback) => {
            let options = {
                contentType: file.type,
                metadata: {
                    "filename": file.name,
                    "filetype": file.type
                }
            };
            let id = new ObjectID();
            fs.createReadStream(file.path).pipe(store.openUploadStream(id, options)).
            on('error', function(err) {
                let failedObj = {};
                failedObj.clientfilename = file.name;
                failedObj.error = err.message;
                resultFileObj.failedfiles.push(failedObj);
                callback();
            }).
            on('finish', function() {
                let fileObj = {};
                fileObj.clientfilename = file.name;
                fileObj.hostsourcefile = id;
                resultFileObj.successfiles.push(fileObj);
                //process.exit(0);
                callback();
            });
            fs.unlinkSync(file.path);
        }, function(err) {
            if (err) {
                return cb(new Error(err), 500);
            }
            return cb(null, 200, resultFileObj);
        });
    });
}
//通过GridFSBucket,使用ID获取存储的文件
export function getBucketFile(cuid, id, filename, cb){
    let tmpid = new ObjectID(id);
    let db = mongoose.connection.db;
    let store = new FSBucket(db);
    store.openDownloadStreamByName(tmpid).
    pipe(fs.createWriteStream(serverConfig.tmpfileUploadUrl + cuid + '/'+filename)).
    on('error', function(err) {
        return cb(new Error(err));
    }).
    on('finish', function() {
        return cb(null,serverConfig.tmpfileUploadUrl + cuid + '/'+filename);
    });
}
//通过文件ID获取文件
export function getGridFile(id,metadata, cb) {
    let tmpid = new ObjectID(id);
    let db = mongoose.connection.db;
    let store = new GridStore(db, tmpid,metadata, "r", {
        root: 'fs'
    });
    store.open(function(err, store) {
        if (err) {
            return cb(new Error(err));
        } else {
            return cb(null, store);
        }
    })
}

//使用二进制的方式将文件存储到mongodb
function putGridFile(buf, id, name, options, cb) {
    let db = mongoose.connection.db;
    new GridStore(db, id, name, "w", options).open(function(err, file) {
        if (err) {
            return cb(new Error(err));
        } else {
            file.write(buf, true, cb);
        }
    });
}

//通过文件路径将文件存储到mongodb
function putGridFileByPath(path, id, name, options, cb) {
    let db = mongoose.connection.db;
    new GridStore(db, id, name, "w", options).open(function(err, file) {
        if (err) {
            return cb(new Error(err));
        } else {
            file.writeFile(path, cb);
        }
    });
}

//通过文件ID删除文件 Deprecated
export function deleteGridFile(id, cb) {
    let db = mongoose.connection.db;
    let tmpid = new ObjectID(id);
    let store = new GridStore(db, tmpid, 'r', {
        root: 'fs'
    });
    store.unlink(function(err, result) {
        if (err) {
            return cb(new Error(err));
        }
        return cb(null);
    });
}
//通过文件ID,使用GridFSBucket删除文件
export function deleteGridFS(id,cb){
    let db = mongoose.connection.db;
    let tmpid = new ObjectID(id);
    let store=new FSBucket(db);
    store.delete(tmpid,(error)=>{
        if(error)
        {
            return cb(new Error(error));
        }
        return cb(null);
    });
}

// 使用formidable上传,并存储到本地
export function fileUpload(userinfo, req, cb) {
    // 如果发送的是二进制数据，使用formidable来提取并保存
    let form = new formidable.IncomingForm();
    let tempdir = serverConfig.tmpfileUploadUrl + userinfo.cuid + '/';
    let localfilepath = serverConfig.fileUploadUrl + userinfo.cuid + '/';
    form.multiples = true;
    form.keepExtensions = true;
    form.uploadDir = tempdir;
    form.maxFieldsSize = serverConfig.fileChunkSize * 1024 * 1024;
    //创建临时文件保存区
    if (fsextra.ensureDirSync(tempdir)) {
        console.log('创建上传临时文件夹成功:' + tempdir);
    }
    if (fsextra.ensureDirSync(localfilepath)) {
        console.log('创建上传永久保存文件夹成功:' + localfilepath);
    }
    // 解析并保存文件块到默认路径
    form.parse(req, function(err, fields, files) {
        if (err) {
            return cb(new Error(err), 500);
        }
    });
    form.on('aborted', function(err) {
        if (err) {
            return cb(new Error(err), 500);
        }
    });
    form.on('error', function(err) {
        if (err) {
            return cb(new Error(err), 500);
        }
    });
    // 在文件保存到临时目录后，再转移到永久保存区路径下
    form.on('end', function(fields, files) {
        if (!this.openedFiles || this.openedFiles.length === 0) {
            return cb(new Error("未发现上传文件"), 404);
        }
        let resultFileObj = {
            successfiles: [],
            failedfiles: []
        };
        let tmpfiles = this.openedFiles;
        tmpfiles.forEach(function(file, index) {
            let temp_path = null;
            let oldfilename = null;
            let newfilename = null;
            temp_path = file.path;
            oldfilename = file.name;
            newfilename = localfilepath + cuid() + path.extname(file.name);
            async.waterfall([(cb1) => {
                // 用覆盖的方式转移临时文件到自定义路径下
                try {
                    fs.renameSync(temp_path, newfilename);
                    cb1(null, "success");
                } catch (e) {
                    let failedObj = {};
                    failedObj.clientfilename = oldfilename;
                    failedObj.error = e.toString();
                    resultFileObj.failedfiles.push(failedObj);
                    cb1(new Error(e), null);
                }
            }, (result2, cb2) => {
                /*
                 * 根据文件类型做不同的处理
                 * .mp3文件需要再处理成.dat和.json文件
                 * 成功后发送本地文件名至客户端
                 */
                audiowaveformTransformToDat(file.type, oldfilename, newfilename, (err, rjson) => {
                    if (err) {
                        let failedObj = {};
                        failedObj.clientfilename = oldfilename;
                        failedObj.error = err.toString();
                        resultFileObj.failedfiles.push(failedObj);
                        cb2(new Error(err), null);
                    } else {
                        cb2(null, rjson);
                    }
                })
            }, (result3, cb3) => {
                audiowaveformTransformToJson(result3, (err, rjson) => {
                    if (err) {
                        let failedObj = {};
                        failedObj.clientfilename = result3.oldfilename;
                        failedObj.error = err.toString();
                        resultFileObj.failedfiles.push(failedObj);
                        cb3(new Error(err), null, null);
                    } else {
                        let fileObj = new Tb_Files();
                        fileObj.cuid = userinfo.cuid;
                        fileObj.fileType = result3.filetype;
                        fileObj.clientName = rjson.clientfilename;
                        fileObj.hostSourceFile = rjson.hostsourcefile;
                        fileObj.createTime = Date.now();
                        if (result3.filetype === "audio/mp3") {
                            fileObj.hostDatFile = rjson.hostdatfile;
                            fileObj.hostJsonFile = rjson.hostjsonfile;
                        }
                        cb3(null, fileObj, rjson);
                    }
                })
            }, (fileObj, result4, cb4) => {
                fileSaveToDB(fileObj, result4, (err, rjson) => {
                    if (err) {
                        let failedObj = {};
                        failedObj.clientfilename = result4.clientfilename;
                        failedObj.error = err.toString();
                        resultFileObj.failedfiles.push(failedObj);
                        cb4(new Error(err), null);
                    } else {
                        cb4(null, resultFileObj.successfiles.push(rjson));
                    }
                })
            }], (asyncErr, result) => {
                if (result === tmpfiles.length) {
                    return cb(null, 200, resultFileObj);
                }
            });
        });
    });
}

export function fileRemove(userinfo, clientName, cb) {
    let query = {
        "cuid": userinfo.cuid,
        "clientName": clientName
    };
    Tb_Files.findOneAndRemove(query, (err, data) => {
        if (err) {
            return cb(new Error(err), 500);
        }
        let returnObj = {};
        let pageState = 0;
        if (data) {
            fileDelete(data.hostSourceFile);
            fileDelete(data.hostDatFile);
            fileDelete(data.hostJsonFile);
            pageState = 200;
            returnObj.state = "success";
        } else {
            pageState = 404;
            returnObj.state = "未发现文件数据";
        }
        return cb(null, pageState, returnObj);
    });
}

export function fileShowData(userinfo, cb) {
    let queryCon = {
        "cuid": userinfo.cuid
    };
    let resultFields = "-_id clientName";
    let sort = {
        sort: {
            createTime: -1
        }
    };
    Tb_Files.find(queryCon, resultFields, sort, (err, resultData) => {
        if (err) {
            return cb(new Error(err), 500);
        }
        let returnObj = {};
        returnObj.filesData = resultData;
        return cb(null, 200, returnObj);
    });
}

export function fileShowFile(userinfo, clientName, filetype, cb) {
    let queryCon = {
        "cuid": userinfo.cuid,
        "clientName": clientName
    };
    let resultStr = "-_id  hostSourceFile hostDatFile hostJsonFile";
    Tb_Files.findOne(queryCon, resultStr, (err1, datas) => {
        if (err1 || !datas) {
            if (err1) {
                return cb(new Error(err1), 500);
            } else {
                return cb(new Error("未发现文件数据"), 404);
            }
        } else {
            switch (filetype) {
                case "mp3":
                    fs.readFile(datas.hostSourceFile, "binary", (err2, file) => {
                        if (err2) {
                            return cb(new Error(err2), 500);
                        } else {
                            return cb(null, 200, file);
                        }
                    })
                    break;
                case "data":
                    fs.readFile(datas.hostDatFile, "binary", (err2, file) => {
                        if (err2) {
                            return cb(new Error(err2), 500);
                        } else {
                            return cb(null, 200, file);
                        }
                    })
                    break;
                case "json":
                    fs.readFile(datas.hostJsonFile, "binary", (err2, file) => {
                        if (err2) {
                            return cb(new Error(err2), 500);
                        } else {
                            return cb(null, 200, file);
                        }
                    })
                    break;
                default:
                    fs.readFile(datas.hostSourceFile, "binary", (err2, file) => {
                        if (err2) {
                            return cb(new Error(err2), 500);
                        } else {
                            return cb(null, 200, file);
                        }
                    })
                    break;
            }
        }
    });
}

export function fileShowURL(userinfo, clientName, filetype, cb) {
    let queryCon = {
        "cuid": userinfo.cuid,
        "clientName": clientName
    };
    let resultStr = "-_id  hostSourceFile hostDatFile hostJsonFile";
    Tb_Files.findOne(queryCon, resultStr, (err1, datas) => {
        if (err1 || !datas) {
            if (err1) {
                return cb(new Error(err1), 500);
            } else {
                return cb(new Error("未发现文件数据"), 404);
            }
        } else {
            switch (filetype) {
                case "json":
                    return cb(null, 200, datas.hostJsonFile);
                    break;
                case "data":
                    return cb(null, 200, datas.hostDatFile);
                    break;
                default:
                    return cb(null, 200, datas.hostSourceFile);
                    break;
            }
        }
    });
}

/*
 * mp3文件通过audiowaveform转换成data和json文件
 * audiowaveform需要在服务器上安装
 * 具体操作参见:https://github.com/bbcrd/audiowaveform
 */
function audiowaveformTransformToDat(filetype, oldfilename, fileallpath, cb) {
    let result = {};
    if (filetype === "audio/mp3") {
        // 获取文件扩展名
        let extension = path.extname(fileallpath);
        // 获取文件名
        let baseFilename = path.basename(fileallpath, extension);
        // 获取本地绝对路径
        let localFilePath = path.dirname(fileallpath) + "/";
        // 设置.dat文件绝对路径
        let dataFilePath = localFilePath + baseFilename + ".dat";
        let cmd = "audiowaveform";
        let args = ['-i', fileallpath, '-o', dataFilePath, '-z', '256', '-b', '16'];
        let child = cprocess.spawn(cmd, args);
        child.on('error', (err) => {
            return cb(new Error(err));
        });
        child.stdout.on('end', () => {
            result.isContinue = true;
            result.oldfilename = oldfilename;
            result.fileallpath = fileallpath;
            result.filetype = filetype;
            return cb(null, result);
        });
    } else {
        result.isContinue = false;
        result.oldfilename = oldfilename;
        result.fileallpath = fileallpath;
        result.filetype = filetype;
        return cb(null, result);
    }
}

function audiowaveformTransformToJson(beforeResult, cb) {
    if (!beforeResult.isContinue) {
        let result = {};
        result.clientfilename = beforeResult.oldfilename;
        result.hostsourcefile = beforeResult.fileallpath;
        return cb(null, result);
    }
    // 获取文件扩展名
    let extension = path.extname(beforeResult.fileallpath);
    // 获取文件名
    let baseFilename = path.basename(beforeResult.fileallpath, extension);
    // 获取本地绝对路径
    let localFilePath = path.dirname(beforeResult.fileallpath) + "/";
    //设置.dat文件绝对路径
    let dataFilePath = localFilePath + baseFilename + ".dat";
    // 设置.json文件绝对路径
    let jsonFilePath = localFilePath + baseFilename + ".json";
    let cmd = "audiowaveform";
    let args = ['-i', dataFilePath, '-o', jsonFilePath];
    let child = cprocess.spawn(cmd, args);
    child.on('error', (err) => {
        return cb(new Error(err));
    });
    child.stdout.on('end', () => {
        let result = {};
        result.clientfilename = beforeResult.oldfilename;
        result.hostsourcefile = beforeResult.fileallpath;
        result.hostdatfile = dataFilePath;
        result.hostjsonfile = jsonFilePath;
        return cb(null, result);
    });
}

function fileDelete(fileallpath) {
    if (fileallpath) {
        if (fs.existsSync(fileallpath)) {
            fs.unlinkSync(fileallpath);
        }
    }
}

function fileSaveToDB(fileObj, beforeResult, cb) {
    let query = {
        "cuid": fileObj.cuid,
        "clientName": fileObj.clientName
    };
    Tb_Files.findOneAndRemove(query, (err1, data) => {
        if (err1) {
            return cb(new Error(err1));
        } else {
            if (data && data.cuid) {
                fileDelete(data.hostSourceFile);
                fileDelete(data.hostDatFile);
                fileDelete(data.hostJsonFile);
            }
            fileObj.save((err2, saved) => {
                if (err2) {
                    return cb(new Error(err2));
                }
                return cb(null, beforeResult);
            });
        }
    });
}