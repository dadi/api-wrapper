const APIWrapper = require ('./index')

const api = new APIWrapper({
  uri: 'http://api.example.com',
  port: 80,
  version: 'vjoin',
  database: 'testdb'
})

const requestObject = api
 .inHooks()
 .find()
 
// const requestObject = api
//  .in('media')
//  .whereFieldIsEqualTo('hello', 'foo')
//  .delete()

console.log(requestObject)