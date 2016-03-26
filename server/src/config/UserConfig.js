import iconv from 'iconv-lite';
const userConfig = {
    qq: {
        //分配给应用的appid
        clientID: '123456',
        //分配给应用的appkey
        clientSecret: 'abc',
        //获取Authorization Code的URL
        accessTokenUri: 'https://graph.qq.com/oauth2.0/me',
        //通过Authorization Code获取Access Token的URL
        authorizationUri: 'https://graph.qq.com/user/get_user_info',
        authorizationGrants: ['credentials'],
        //回调URL
        redirectUri: iconv.encode('', 'utf8'),
        //client端的状态值。用于第三方应用防止CSRF攻击，成功授权后回调时会原样带回。请务必严格按照流程检查用户与state参数状态的绑定
        scopes: ['authorization', 'zhouyi', 'lianghan'],
    },
    weixin: {
        clientID: '123456',
        clientSecret: '',
        accessTokenUri: 'https://open.weixin.qq.com/connect/qrconnect',
        authorizationUri: 'https://api.weixin.qq.com/sns/oauth2/access_token',
        authorizationGrants: ['credentials'],
        redirectUri: iconv.encode('', 'utf8'),
        scopes: ['authorization', 'zhouyi', 'lianghan'],
    },
    weibo: {
        clientID: '123456',
        clientSecret: '',
        accessTokenUri: 'https://api.weibo.com/oauth2/authorize',
        authorizationUri: 'https://api.weibo.com/oauth2/access_token',
        authorizationGrants: ['credentials'],
        redirectUri: iconv.encode('', 'utf8'),
        scopes: ['authorization', 'zhouyi', 'lianghan'],
    }
};

export default userConfig;