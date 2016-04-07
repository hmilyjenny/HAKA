import * as fileManager from '../APIs/fileManager';
import path from 'path';

export function fileUpload(req, res) {
    fileManager.fileUpload(req.headers.userinfo, req, (err, code, result) => {
        if (err) {
            res.status(code).send(err.message);
        } else {
            res.status(code).send(result);
        }
    });
}

export function fileRemove(req, res) {
    if (!req.body.clientName) {
        return res.status(400).send('未发现clientName参数');
    }
    fileManager.fileRemove(req.headers.userinfo, req.body.clientName, (err, code, result) => {
        if (err) {
            res.status(code).send(err.message);
        } else {
            res.status(code).send(result);
        }
    });
}

export function fileShowData(req, res) {
    fileManager.fileShowData(req.headers.userinfo, (err, code, result) => {
        if (err) {
            res.status(code).send(err.message);
        } else {
            res.status(code).send(result);
        }
    });
}

export function fileShowFile(req, res) {
    if (!req.body.clientName) {
        return res.status(400).send('未发现clientName参数');
    }
    let userinfo = req.headers.userinfo;
    let clientName = req.body.clientName;
    let fileType = req.body.fileType;
    fileManager.fileShowFile(userinfo, clientName, fileType, (err, code, result) => {
        if (err) {
            res.status(code).send(err.message);
        } else {
            switch (fileType) {
                case "mp3":
                    res.writeHead(200, {
                        "Content-Type": "audio/mp3"
                    });
                    break;
                case "json":
                case "data":
                    res.writeHead(200, {
                        "Content-Type": "application/octet-stream"
                    });
                    break;
                default:
                    res.writeHead(200, {
                        "Content-Type": "image/jpeg"
                    });
                    break;
            }
            res.write(result, "binary");
            res.end();
        }
    });
}

export function fileLoadFile(req, res) {
    if (!req.params.filename || !req.params.cuid) {
        return res.status(400).send('未发现filename或cuid参数');
    }
    let userinfo = {
        newToken: null,
        cuid: req.params.cuid
    };
    let clientName = req.params.filename;
    let filetype = req.params.filetype;
    fileManager.fileShowURL(userinfo, clientName, filetype, (err, code, result) => {
        if (err) {
            res.status(code).send(err.message);
        } else {
            res.status(code).sendFile(path.resolve(result));
        }
    });
}