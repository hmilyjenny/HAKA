import * as fileManager from '../APIs/fileManager'

export function fileUpload(req, res) {
    fileManager.fileUpload(req.headers.userinfo, req, (err, result) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            if (req.headers.userinfo.newToken) {
                result.newToken = req.headers.userinfo.newToken;
            }
            res.status(200).send(result);
        }
    });
}

export function fileRemove(req, res) {
    if (!req.body.clientName) {
        return res.status(403).send('未发现clientName参数');
    }
    fileManager.fileRemove(req.headers.userinfo, req.body.clientName, (err, result) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            if (req.headers.userinfo.newToken) {
                result.newToken = req.headers.userinfo.newToken;
            }
            res.status(200).send(result);
        }
    });
}

export function fileShowData(req, res) {
    fileManager.fileShowData(req.headers.userinfo, (err, result) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            if (req.headers.userinfo.newToken) {
                result.newToken = req.headers.userinfo.newToken;
            }
            res.status(200).send(result);
        }
    });
}

export function fileShowFile(req, res) {
    if (!req.body.clientName) {
        return res.status(403).send('未发现clientName参数');
    }
    let userinfo = req.headers.userinfo;
    let clientName = req.body.clientName;
    let fileType = req.body.fileType;
    fileManager.fileShowFile(userinfo, clientName, fileType, (err, result) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            let newToken = "";
            if (req.headers.userinfo.newToken) {
                newToken = req.headers.userinfo.newToken
            }
            switch (fileType) {
                case "mp3":
                    res.writeHead(200, {
                        "Content-Type": "audio/mp3",
                        "newToken": newToken
                    });
                    break;
                case "json":
                case "data":
                    res.writeHead(200, {
                        "Content-Type": "application/octet-stream",
                        "newToken": newToken
                    });
                    break;
                default:
                    res.writeHead(200, {
                        "Content-Type": "image/jpeg",
                        "newToken": newToken
                    });
                    break;
            }
            res.write(result, "binary");
            res.end();
        }
    });
}