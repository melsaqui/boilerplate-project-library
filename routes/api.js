/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
require('dotenv').config();
const { ObjectId,MongoClient } = require('mongodb');
const BSON = require('bson');
const URI = process.env.MONGO_URI; // Declare MONGO_URI in your .env file
const client = new MongoClient(URI);

module.exports = function (app) {
try{
  client.connect();
  app.route('/api/books')
  .get(async function (req, res){
    const myDataBase = client.db('projLibrary-QA-freeCodeCamp').collection('books');
    let result =await myDataBase.find().toArray()
    return res.json(result)

    //response will be array of book objects
    //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
  })
  
  .post(async function (req, res){
    let title = req.body.title;
    let result
    if (title == undefined || title ==''||title ==null)
      return res.json('missing required field title')
    const myDataBase = client.db('projLibrary-QA-freeCodeCamp').collection('books');
    let inserted=  await myDataBase.insertOne({'title':title})
    if (inserted!=null && inserted['acknowledged'] && inserted['insertedId']!=null){
      result = (await myDataBase.findOne({_id: inserted['insertedId']}))
      let comments=[]
      await myDataBase.updateOne({_id:inserted['insertedId']}, {$set:{commentcount:0,comments:comments}})

    }
    res.json (result)

   // console.log('post')

    //response will contain new book object including atleast _id and title
  })
  
  .delete(async function(req, res){
    const myDataBase = client.db('projLibrary-QA-freeCodeCamp').collection('books');

    let del= await myDataBase.drop();
    //console.log(del)
    if(del)
      return (res.json('complete delete successful'))
    else
      return (res.json('an error occured'))

    //if successful response will be 'complete delete successful'
  });



app.route('/api/books/:id')
  .get(async function (req, res){
    let bookid = req.params.id;
    bookid=new BSON.ObjectId(bookid)

    const myDataBase =  client.db('projLibrary-QA-freeCodeCamp').collection('books');
    let result=(await myDataBase.findOne({_id:bookid}))
    if (result==null || result==undefined|| result.length==0)
      return res.json('no book exists')
    else
      return (res.json(result))
    //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
  })
  
  .post(async function(req, res){
    let bookid = req.params.id;
    let comment = req.body.comment;
    bookid=new BSON.ObjectId(bookid)
    if (comment==undefined|| comment==null || comment==''){
      return res.json("missing required field comment")
    }
    const myDataBase = await client.db('projLibrary-QA-freeCodeCamp').collection('books');
    var upd= await myDataBase.updateOne({_id:bookid},{$push:{comments:comment}});
    if(upd['modifiedCount']>0 && upd['acknowledged'])
      upd= await myDataBase.updateOne({_id:bookid},{$inc:{commentcount:+1}});

    if(upd['modifiedCount']>0 && upd['acknowledged'])
      return res.json(await myDataBase.findOne({_id: bookid}))
    else if (upd['modifiedCount']==0 && upd['acknowledged'])
      return(res.json("no book exists"))
    else
      return res.json({ error: "could not update", '_id' :bookid })
    //json res format same as .get
  })
  
  .delete(async function(req, res){
    let bookid = req.params.id;
    bookid=new BSON.ObjectId(bookid)
    const myDataBase = client.db('projLibrary-QA-freeCodeCamp').collection('books');
    var del= await myDataBase.deleteOne({_id:bookid});

    if(del!=undefined&&del['acknowledged'] && del['deletedCount'] >0  )
      return res.json("delete successful")
    else if (del['deletedCount'] == 0){
      return res.json("no book exists")
    }
    else{
      return res.json({'error': 'could not delete', '_id': bookid })
    }
    //if successful response will be 'delete successful'
  });
}catch(e) {
  // Catch any errors
  console.error(e);
  throw new Error('Unable to Connect to Database')

}
 
  
};
