'use strict';

var xlsx = require('node-xlsx');
const fs = require('fs');

exports.main = async (event, context) => {
    //event为客户端上传的参数
    console.log('event : ' + event)

    // 需要写入excel的数据，通常可能是从数据库中查询获得，这里为演示，使用本地数据
    var data = [{
        name: 'sheet1',
        data: [
            [
                '序号',
                '姓名',
                '年龄'
            ],
            [
                '1',
                '丁元英',
                '40'

            ],
            [
                '2',
                '韩楚风',
                '45'
            ]
        ]
    }, {
        name: 'sheet2',
        data: [] // sheet2的数据，此处省略
    }]

    let buffer = xlsx.build(data);

    let fileName = '导出结果_' + new Date().getTime() + '.xlsx' //导出文件名

    // 写入文件
    fs.writeFileSync('/tmp/' + fileName, buffer, {});

    console.log("Write completed.");

    const fileStream = fs.createReadStream('/tmp/' + fileName)

    //上传文件到云存储
    let uploadRes = await uniCloud.uploadFile({
        cloudPath: fileName,
        fileContent: fileStream
    })

    if (uploadRes.fileID) { //上传成功
        //获取临时下载地址
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
        } else {
            console.log("getTempFileURL fail");
            return {
                code: 'error',
                msg: '获取文件下载地址失败'
            }
        }
    }

    //返回数据给客户端
    return {}
};
