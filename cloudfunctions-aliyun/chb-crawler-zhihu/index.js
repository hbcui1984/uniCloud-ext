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
 
  //获取已存库的最大文章ID
  let maxIdInDb = await getMaxId();
  
  // 开始抓取首页链接
  let indexArr = []
  let html = request('GET', host).getBody().toString();
  let $ = cheerio.load(html);
  // 获取文章节点
  let list = $('.main-content-wrap .row').find('.link-button')
  for (var i = 0; i < list.length; i++) {
    let href = list.eq(i).attr("href")
    let _id = parseInt(href.substring(7)) //文章ID
    console.log("当前ID："+_id+",maxId:"+maxIdInDb);
    // 找出未入库的文章ID
    if(_id > maxIdInDb){
      indexArr.push(i)
    }
  }
  
  console.log('新增文章数量：',indexArr.length);

  // 循环抓取每个新文章详情页
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

/**
 * 获取已存库的最大文章ID
 */
async function getMaxId(){
  // 获取已存库的最大文章ID
  const record = await collection.field({
    zhihu_id: true
  }).orderBy("zhihu_id", "desc").limit(1).get()
  
  let maxIdInDb = 0
  if (record && record.data && record.data.length > 0) {
    maxIdInDb = record.data[0].zhihu_id
  }
  return maxIdInDb
}

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
  
  console.log('path:',host + path);

  let html = request('GET', host + path).getBody().toString();
  let $ = cheerio.load(html);

  article.author = $('.author').text() //取作者信息
  //获取文章内容，注意使用html-entities解码
  article.content = entities.decode($('.content').html())
  article.create_date = new Date().getTime()

  const addRes = await collection.add(article)
  if (addRes.id || addRes.affectedDocs === 1) {
    console.log(title + " -> 添加成功");
  }

}