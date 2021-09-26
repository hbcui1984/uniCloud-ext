这是一个在云函数中将数据导出为Excel，并返回下载链接的示例，供有需要的开发者参考。

本示例已提供完整可运行的代码，本文简要说明代码过程

1. 获取数据并写入excel文件

```
var data = []
let buffer = xlsx.build(data);

let fileName = '导出结果_' + new Date().getTime() + '.xlsx' //导出文件名

// 写入文件
fs.writeFileSync('/tmp/' + fileName, buffer, {});
```

2. 上传文件到云存储

```
const fileStream = fs.createReadStream('/tmp/' + fileName)

//上传文件到云存储
let uploadRes = await uniCloud.uploadFile({
    cloudPath: fileName,
    fileContent: fileStream
})
```

3. 获取下载链接并返回给客户端

```
let getUrlRes = await uniCloud.getTempFileURL({
    fileList: [uploadRes.fileID]
})

//获取文件临时下载地址
if (getUrlRes.fileList && getUrlRes.fileList.length > 0 && getUrlRes.fileList[0].code == "SUCCESS") {
    console.log("getTempFileURL success");
    //返回下载地址
    return {
        code: 'SUCCESS',
        url: getUrlRes.fileList[0].download_url
    }
} 
```

**注意事项：**

1. 需提前安装 node-xlsx 依赖，本示例的 node_modules 已内置
2. 更多 excel 读写用法参考：[https://github.com/mgcrea/node-xlsx](https://github.com/mgcrea/node-xlsx)
