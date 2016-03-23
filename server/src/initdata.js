import tbUser from './models/databaseModels/tb_User';
import md5 from 'md5';
import cuid from 'cuid';

export default function() {
  tbUser.count().exec((err, count) => {
    if (count > 0) {
      return;
    }
    const tmpPW = 'lhzy123456';
    const userMain = new tbUser({
      userName: 'administrator',
      userPassword: md5(tmpPW),
      userEmail: null,
      userTel: null,
      isLogin: false,
      loginedTime: null,
      logoutedTime: null,
      loginType: null,
      createTime: Date.now,
      cuid: cuid()
    });

    tbUser.create([userMain], (error) => {
      if (!error) {
        // console.log('ready to go....');
      } else {
        console.log('初始化数据库失败:' + error);
      }
    });
  });
}