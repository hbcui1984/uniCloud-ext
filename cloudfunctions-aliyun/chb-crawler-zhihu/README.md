云函数爬虫示例：爬取知乎日报并存入云数据库

这是云函数中实现爬虫的示例，体验方式如下：

1. 使用 HBuilderX 导入本插件
2. 安装依赖，进入该插件目录，执行：`npm install`
3. 初始化数据库，在[uniCloud控制台](https://unicloud.dcloud.net.cn/)创建`zhihu-daily-articles`数据表；或者将`db_init.json`移到`cloudfunction-(aliyun|tcb)`根目录下，右键 -> 初始化云数据库。
4. 本地运行，右键 -> 本地运行云函数
5. 云端定时运行，上传云函数，然后到[uniCloud控制台](https://unicloud.dcloud.net.cn/)设置定时器，参考[定时触发](https://uniapp.dcloud.net.cn/uniCloud/trigger)


本插件依赖库说明：
1. sync-request：同步请求
2. cheerio：服务端的dom操作，jquery 一样的API访问方式
3. html-entities：编码转换

