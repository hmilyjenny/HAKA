import * as tokenManager from '../APIs/tokenManager';
import * as logManager from '../APIs/logManager';

export function verifyToken(req, res, next) {
    tokenManager.verifyToken(req.headers, (err, code, result) => {
        if (err) {
            res.status(code).send(err.message);
        } else {
            req.headers.userinfo = result;
            if (code === 401) {
                req.headers.RefreshToken = true;
            } else {
                req.headers.RefreshToken = false;
            }
            next();
        }
    })
}

export function RefreshToken(req, res) {
    if (!req.headers.authorization) {
        res.status(412).send("Token未找到");
    } else {
        let token = req.headers.authorization;
        tokenManager.RefreshToken(token, (err, code, result) => {
            if (err) {
                res.status(code).send(err.message);
            } else {
                req.headers.RefreshToken = false;
                res.status(code).json({
                    token: result
                });
            }
        })
    }
}