var mockery = require('mockery')
var nock = require('nock')
var path = require('path')
var querystring = require('query-string')
var should = require('should')
var sinon = require('sinon')
var url = require('url')

var apiWrapper = require(__dirname + '/../../index')

var wrapper
var field = 'name'
var value = 'John Doe'
var matches = ['John', 'Jane']

var options = {
  uri: 'http://0.0.0.0',
  port: 8000,
  tokenUrl: '/token',
  credentials: {
    clientId: 'test',
    secret: 'secret'
  }
}

var tokenScope
var findScope

var fakeResponse = {
  results: [
    { name: 'John' },
    { name: 'Jane' }
  ],
  metadata: {
    totalCount: 2
  }
}

describe('Terminators', function (done) {
  before(function (done) {
    // mockery.enable({
    //   warnOnReplace: false,
    //   warnOnUnregistered: false,
    //   useCleanCache: true
    // })

    // mockery.registerMock('request-promise', function () {
    //   var response = { hello: 'world' }
    //   return Promise.resolve(response.trim())
    // })

    done()
  })

  after(function (done) {
    // mockery.disable()
    // mockery.deregisterAll()
    done()
  })

  beforeEach(function () {
    wrapper = new apiWrapper(options)
  })

  describe('find', function () {
    beforeEach(function() {
      tokenScope = nock(options.uri + ':' + options.port)
        .post(options.tokenUrl)
        .reply(200, {
          accessToken: "d08c2efb-c0d6-446a-ba84-4a4199c9e0c5",
          tokenType: "Bearer",
          expiresIn: 1800
        })
    })

    it('should return the results array when extractResults is specified', function () {

      var query = { filter: JSON.stringify({ name: 'John' }) }
      var expectedQuerystring  = '?' + querystring.stringify(query, {strict: false})
      var host = options.uri + ':' + options.port
      var urlPath = '/1.0/test/collectionOne' + expectedQuerystring

      var findScope = nock(host).get(urlPath).reply(200, fakeResponse)

      return wrapper
        .useVersion('1.0')
        .useDatabase('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .find({extractResults: true})
        .then(function (data) {
          data.should.eql(fakeResponse.results)
        })
    })

    it('should return the full results object when extractResults is not specified', function () {

      var query = { filter: JSON.stringify({ name: 'John' }) }
      var expectedQuerystring  = '?' + querystring.stringify(query, {strict: false})
      var host = options.uri + ':' + options.port
      var urlPath = '/1.0/test/collectionOne' + expectedQuerystring

      var findScope = nock(host).get(urlPath).reply(200, fakeResponse)

      return wrapper
        .useVersion('1.0')
        .useDatabase('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .find()
        .then(function (data) {
          data.should.eql(fakeResponse)
        })
    })

    it('should return the full results object when extractResults = false', function () {

      var query = { filter: JSON.stringify({ name: 'John' }) }
      var expectedQuerystring  = '?' + querystring.stringify(query, {strict: false})
      var host = options.uri + ':' + options.port
      var urlPath = '/1.0/test/collectionOne' + expectedQuerystring

      var findScope = nock(host).get(urlPath).reply(200, fakeResponse)

      return wrapper
        .useVersion('1.0')
        .useDatabase('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .find({extractResults: false})
        .then(function (data) {
          data.should.eql(fakeResponse)
        })
    })

    it('should return the metadata object when extractMetadata = true', function () {

      var query = { filter: JSON.stringify({ name: 'John' }) }
      var expectedQuerystring  = '?' + querystring.stringify(query, {strict: false})
      var host = options.uri + ':' + options.port
      var urlPath = '/1.0/test/collectionOne' + expectedQuerystring

      var findScope = nock(host).get(urlPath).reply(200, fakeResponse)

      return wrapper
        .useVersion('1.0')
        .useDatabase('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .find({extractMetadata: true})
        .then(function (data) {
          data.should.eql(fakeResponse.metadata)
        })
    })
  })
})
