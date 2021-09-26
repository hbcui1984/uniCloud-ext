** 注意：uni官方已提供redis接入方案，推荐使用官方方案，详见：[Redis扩展](https://uniapp.dcloud.net.cn/uniCloud/redis-introduction)**

这是一个在云函数中连接 redis 的简易示例，供有需要的开发者参考。

代码很简单，几个注意事项：

1. 注意修改代码示例中的 redis server 地址及鉴权密码

```
var client = redis.createClient(6379, '127.0.0.1') //连接服务器地址
client.auth('your-password') //密码鉴权
```

2. 需提前安装 redis 依赖，本示例的 node_modules 已内置
3. 更多 redis 用法参考：[https://github.com/NodeRedis/node-redis](https://github.com/NodeRedis/node-redis)
4. 注意：所有 API 必须使用同步接口，不支持异步回调方式

```
 //变更为同步写法，重要！！！
    const getAsync = promisify(client.get).bind(client);
    const lrangeAsync = promisify(client.lrange).bind(client);
```

5. 基于云函数的部署原理，和你的redis可能不在一个内网中，访问速度可能不如预期

