const path = require('path')
const should = require('should')
const sinon = require('sinon')

const apiWrapper = require(__dirname + '/../../index')

let wrapper
const field = 'name'
const value = 'John Doe'
const matches = ['John', 'Jane']

const options = {
  uri: '0.0.0.0',
  port: 8000,
  tokenUrl: '/token',
  credentials: {
    clientId: 'test',
    secret: 'secret'
  }
}

describe('Filters', function(done) {
  before(function(done) {
    done()
  })

  beforeEach(function() {
    wrapper = new apiWrapper(options)
  })

  it('should pass argument given in `fromEndpoint` to the wrapper', function(done) {
    wrapper.fromEndpoint('testEndpoint')
    wrapper.endpoint.should.eql('testEndpoint')
    done()
  })

  it('should pass argument given in `goToPage` to the wrapper', function(done) {
    wrapper.goToPage(1)
    wrapper.page.should.eql(1)
    done()
  })

  it('should pass argument given in `in` to the wrapper', function(done) {
    wrapper.in('collectionOne')
    wrapper.collection.should.eql('collectionOne')
    done()
  })

  it('should pass argument given in `limitTo` to the wrapper', function(done) {
    wrapper.limitTo(10)
    wrapper.limit.should.eql(10)
    done()
  })

  it('should pass arguments given in `sortBy` to the wrapper', function(done) {
    wrapper.sortBy('name', 'desc')
    wrapper.sort.should.eql({name: -1})
    done()
  })

  it('should pass argument given in `useDatabase` to the wrapper', function(done) {
    wrapper.useDatabase('test')
    wrapper.customDatabase.should.eql('test')
    done()
  })

  it('should pass argument given in `useFields` to the wrapper', function(done) {
    wrapper.useFields(['name', '_id'])
    wrapper.fields.should.eql(JSON.stringify({name: 1, _id: 1}))
    done()
  })

  it('should set the saved query to a Mongo query expression', function(done) {
    wrapper.where({})
    wrapper.query.should.eql({})
    done()
  })

  it('should add a /^value/i regex expression to the saved query', function(done) {
    wrapper.whereFieldBeginsWith(field, value)
    wrapper.query.should.eql(
      JSON.parse('{ "name": { "$regex": "^John Doe" } }')
    )
    done()
  })

  it('should add a /value/i regex expression to the saved query', function(done) {
    wrapper.whereFieldContains(field, value)
    wrapper.query.should.eql(JSON.parse('{ "name": { "$regex": "John Doe" } }'))
    done()
  })

  it('should add a negated /value/i regex expression to the saved query', function(done) {
    wrapper.whereFieldDoesNotContain(field, value)
    wrapper.query.should.eql(
      JSON.parse('{ "name": { "$not": "/John Doe/i" } }')
    )
    done()
  })

  it('should add a {$exists: true} expression to the saved query', function(done) {
    wrapper.whereFieldExists(field)
    wrapper.query.should.eql(JSON.parse('{ "name": { "$ne": null } }'))
    done()
  })

  it('should add a {$exists: false} expression to the saved query', function(done) {
    wrapper.whereFieldDoesNotExist(field)
    wrapper.query.should.eql(JSON.parse('{ "name": { "$eq": null } }'))
    done()
  })

  it('should add a /value$/i regex expression to the saved query', function(done) {
    wrapper.whereFieldEndsWith(field, value)
    wrapper.query.should.eql(
      JSON.parse('{ "name": { "$regex": "John Doe$" } }')
    )
    done()
  })

  it('should add an exact match expression to the saved query', function(done) {
    wrapper.whereFieldIsEqualTo(field, value)
    wrapper.query.should.eql(JSON.parse('{ "name": "John Doe" }'))
    done()
  })

  it('should add a negated exact match expression to the saved query', function(done) {
    wrapper.whereFieldIsNotEqualTo(field, value)
    wrapper.query.should.eql(
      JSON.parse('{ "name": { "$not" : "/^John Doe$/i" } }')
    )
    done()
  })

  it('should add a negated exact match expression to the saved query when given a Number', function(done) {
    wrapper.whereFieldIsNotEqualTo(field, 34)
    wrapper.query.should.eql(JSON.parse('{ "name": { "$ne" : 34 } }'))
    done()
  })

  it('should add a $in expression to the saved query', function(done) {
    wrapper.whereFieldIsOneOf(field, matches)
    wrapper.query.should.eql(
      JSON.parse('{ "name": { "$in" : ["John", "Jane"] } }')
    )
    done()
  })

  it('should add a $nin expression to the saved query', function(done) {
    wrapper.whereFieldIsNotOneOf(field, matches)
    wrapper.query.should.eql(
      JSON.parse('{ "name": { "$nin" : ["John", "Jane"] } }')
    )
    done()
  })

  it('should add a $lt expression to the saved query', function(done) {
    wrapper.whereFieldIsLessThan('age', 50)
    wrapper.query.should.eql(JSON.parse('{ "age": { "$lt" : 50 } }'))
    done()
  })

  it('should add a $lte expression to the saved query', function(done) {
    wrapper.whereFieldIsLessThanOrEqualTo('age', 50)
    wrapper.query.should.eql(JSON.parse('{ "age": { "$lte" : 50 } }'))
    done()
  })

  it('should add a $gt expression to the saved query', function(done) {
    wrapper.whereFieldIsGreaterThan('age', 50)
    wrapper.query.should.eql(JSON.parse('{ "age": { "$gt" : 50 } }'))
    done()
  })

  it('should add a $gte expression to the saved query', function(done) {
    wrapper.whereFieldIsGreaterThanOrEqualTo('age', 50)
    wrapper.query.should.eql(JSON.parse('{ "age": { "$gte" : 50 } }'))
    done()
  })

  it('should pass argument given in `withComposition` to the wrapper', function(done) {
    wrapper.withComposition(true)
    wrapper.compose.should.eql(true)
    done()
  })

  it('should pass argument given in `includeHistory` to the wrapper', function(done) {
    wrapper.includeHistory(true)
    wrapper.history.should.eql(true)
    done()
  })
})
