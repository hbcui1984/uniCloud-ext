'use strict';

const {
    promisify
} = require("util");
var redis = require('redis')


exports.main = async (event, context) => {
    //event为客户端上传的参数
    console.log('event : ' + event)

    var client = redis.createClient(6379, '127.0.0.1') //连接服务器地址
    client.auth('your-password') //密码鉴权
    client.on('error', function(err) {
        console.log('Error ' + err);
    });

    //变更为同步写法，重要！！！
    const getAsync = promisify(client.get).bind(client);
    const lrangeAsync = promisify(client.lrange).bind(client);

    let result = {}

    try {
        //字符串类型存值
        client.set('strDemo', '我是value')
        //字符串类型取值
        result.name = await getAsync('strDemo')

        //列表类型存值
        client.lpush('listDemo', 'list' + parseInt(Math.random() * 100))
        //获取列表元素
        result.list = await lrangeAsync('listDemo', 0, 10)
    } catch (e) {
        console.log('error', e);
    }

    client.quit()

    console.log(result);

    //返回数据给客户端
    return result
};
