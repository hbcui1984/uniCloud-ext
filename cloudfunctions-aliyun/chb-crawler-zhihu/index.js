'use strict';

let request = require('sync-request')
let cheerio = require('cheerio');
let Entities = require('html-entities').XmlEntities;
let entities = new Entities();

const host = 'https://daily.zhihu.com'
const db = uniCloud.database();
const collection = db.collection('zhihu-daily-articles')
const dbCmd = db.command

exports.main = async (event, context) => {
  //event为客户端上传的参数
  console.log('event : ' + event)

  let html = request('GET', host).getBody().toString();
  let $ = cheerio.load(html);

  // 获取文章节点
  let list = $('.main-content-wrap .row').find('.link-button')
  
  
  const maxIdRecord = await collection.field({
    zhihu_id: true
  }).orderBy("zhihu_id", "desc").limit(1).get()
  
  let maxIdInDb = 0
  if (maxIdRecord && maxIdRecord.data && maxIdRecord.data.length > 0) {
    maxIdInDb = maxIdRecord.data[0].zhihu_id
  }
  

  let indexArr = []

  for (var i = 0; i < list.length; i++) {
    let href = list.eq(i).attr("href")
    let _id = parseInt(href.substring(7)) //文章ID
    console.log("当前ID："+_id+",maxId:"+maxIdInDb);
    if(_id > maxIdInDb){
      indexArr.push(i)
    }
  }
  
  console.log('新增文章数量：',indexArr.length);

  if(indexArr.length>0){
    for (let i = 0; i < indexArr.length; i++) {
      let href = list.eq(indexArr[i]).attr("href")
      let imgSrc = list.eq(indexArr[i]).find('img').attr('src')
      let title = list.eq(indexArr[i]).find('.title').text()
      await saveArticle(href, title, imgSrc)
    }
  }

  //返回数据给客户端
  return event
};
/** 抓取文章详情内容并存库
 * @param {Object} path
 * @param {Object} title
 * @param {Object} preview_image
 */
async function saveArticle(path, title, preview_image) {
  
  console.log(title + " -> 开始抓取");

  let article = {
    zhihu_id: parseInt(path.substr(7)),
    title,
    preview_image
  }

  let html = request('GET', host + path).getBody().toString();
  let $ = cheerio.load(html);

  console.log('作者1：',$('.ZhihuDaily-AuthorLine').html());
  console.log('作者2：',$('ZhihuDaily-Author').text());

  article.author = $('.ZhihuDaily-Author').text() //取作者信息
  //获取文章内容，注意使用html-entities解码
  article.content = entities.decode($('.content').html())
  article.create_date = new Date().getTime()

  const addRes = await collection.add(article)
  if (addRes.id || addRes.affectedDocs === 1) {
    console.log(title + " -> 添加成功");
  }

}

/**
 * 延时
 * @param {Object} ms
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
