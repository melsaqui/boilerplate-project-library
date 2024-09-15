/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);
require('dotenv').config();
const { ObjectId,MongoClient } = require('mongodb');
const BSON = require('bson');
const URI = process.env.MONGO_URI; // Declare MONGO_URI in your .env file
const client = new MongoClient(URI);
let last;
async function getLast(){
  try{
    client.connect();
    const myDataBase =   await client.db('projLibrary-QA-freeCodeCamp').collection('books');
    last =(  await myDataBase.findOne({}, {sort:{$natural:-1}}));
  }catch(e) {
    console.error(e);
    throw new Error('Unable to Connect to Database')
  
  }
}
getLast()

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai
        .request(server)
        .keepOpen()
        .post('/api/books')
        .send({title:"A title"})
        .end(async function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type,'application/json','Response should be json', );
          assert.equal(res.body.title,'A title')
        done();
      });
      getLast();

    });
      
      test('Test POST /api/books with no title given', function(done) {
        chai
        .request(server)
        .keepOpen()
        .post('/api/books')
        .send({title:""})
        .end(async function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type,'application/json','Response should be json', );
          assert.equal(res.body,"missing required field title")
        done();
        });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      test('Test GET /api/books',  function(done){
        chai
              .request(server)
              .keepOpen()
              .get('/api/books')
              .end(async function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.type,'application/json','Response should be json', );
                assert.isArray(res.body)
                //assert.isNotEmpty(res.body)
                done();
              });
       // done();
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){  
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai
        .request(server)
        .keepOpen()
        .get('/api/books/66e3681df788c4001399aa8d')
        .end(async function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type,'application/json','Response should be json', );
          assert.equal(res.body,'no book exists')
          assert.isNotEmpty(res.body)
          done();
        });
      });

      test('Test GET /api/books/[id] with valid id in db',  function(done){
        getLast()
       let getRoute=('/api/books/')+(String(last['_id']))
        chai
        .request(server)
        .keepOpen()
        .get(String(getRoute))
        .end(async function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type,'application/json','Response should be json', );
          assert.equal(res.body._id,last['_id'])
          assert.isNotEmpty(res.body)
          done();
        });

      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){

      test('Test POST /api/books/[id] with comment', function(done){
        getLast();
        let getRoute=('/api/books/')+(String(last['_id']))
        chai
        .request(server)
        .keepOpen()
        .post(String(getRoute))
        .send({comment:"This is a comment"})
        .end(async function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type,'application/json','Response should be json', );
          assert.equal(res.body._id,last['_id'])
          assert.isNumber(res.body.commentcount)
          assert.isAbove(res.body.commentcount,0)
          assert.equal(res.body.commentcount,last['commentcount']+1)
          assert.include(res.body.comments,"This is a comment")
          assert.isNotEmpty(res.body)
          done();
        });

      });
      

      test('Test POST /api/books/[id] without comment field', function(done){
        const getRoute=('/api/books/')+(String(last['_id']))
        chai
        .request(server)
        .keepOpen()
        .post(String(getRoute))
        .send({comment:""})
        .end(async function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type,'application/json','Response should be json', );
          assert.isNotEmpty(res.body)
          assert.equal(res.body,"missing required field comment");
          done();
        });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        chai
        .request(server)
        .keepOpen()
        .post('/api/books/66e3681df788c4001399aa8d')
        .send({comment:"A comment"})
        .end(async function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type,'application/json','Response should be json', );
          assert.equal(res.body,'no book exists')
          assert.isNotEmpty(res.body)
          done();
        });
      });
      
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        getLast()
        let getRoute=('/api/books/')+(String(last['_id']))
         chai
         .request(server)
         .keepOpen()
         .delete(String(getRoute))
         .end(async function (err, res) {
           assert.equal(res.status, 200);
           assert.equal(res.type,'application/json','Response should be json', );
           assert.isNotEmpty(res.body)
           assert.equal(res.body,"delete successful");
           getLast()
           console.log(last)
           done();
         });
      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        chai
        .request(server)
        .keepOpen()
        .delete('/api/books/66e3681df788c4001399aa8d')
        .send({comment:"A comment"})
        .end(async function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type,'application/json','Response should be json', );
          assert.equal(res.body,'no book exists')
          assert.isNotEmpty(res.body)
         
          done();
        });
      });

    });

  });

});
