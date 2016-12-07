var mockery = require('mockery')
var nock = require('nock')
var path = require('path')
var querystring = require('query-string')
var should = require('should')
var sinon = require('sinon')
var url = require('url')
var _ = require('underscore')

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
var fakeResponse

var documents = [
  { _id: 1, name: 'John' },
  { _id: 2, name: 'Jane' }
]

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

    fakeResponse = {
      results: [
        { _id: 1, name: 'John' },
        { _id: 2, name: 'Jane' }
      ],
      metadata: {
        totalCount: 2
      }
    }

    tokenScope = nock(options.uri + ':' + options.port)
      .post(options.tokenUrl)
      .reply(200, {
        accessToken: "d08c2efb-c0d6-446a-ba84-4a4199c9e0c5",
        tokenType: "Bearer",
        expiresIn: 1800
      })
  })

  describe('apply', function () {
    it('should throw an error if no collection is specified', function () {
      should.throws(function () {
        return wrapper
        .useVersion('1.0')
        .useDatabase('test')
        .whereFieldIsEqualTo(field, value)
        .apply(function(){})
      })
    })

    it('should throw an error if no query is specified', function () {
      should.throws(function () {
        return wrapper
        .useVersion('1.0')
        .useDatabase('test')
        .in('collectionOne')
        .apply(function(){})
      })
    })

    it('should throw an error if no callback is passed', function () {
      should.throws(function () {
        return wrapper
        .useVersion('1.0')
        .useDatabase('test')
        .in('collectionOne')
        .whereFieldIsEqualTo(field, value)
        .apply()
      })
    })

    it('should process each returned document using the callback', function () {
      var query = { filter: JSON.stringify({ name: 'John Doe' }) }
      var expectedQuerystring  = '?' + decodeURIComponent(querystring.stringify(query))
      var host = options.uri + ':' + options.port
      var get = '/1.0/test/collectionOne' + expectedQuerystring
      var put = '/1.0/test/collectionOne'

      // Prepare a fake response body for the GET request inside
      // API Wrapper
      var fakeGet = _.clone(fakeResponse)
      fakeGet.results[0].age = 10
      fakeGet.results[1].age = 20

      var findScope = nock(host).get(get).reply(200, fakeGet)

      // Prepare fake response bodies for the PUT request inside
      // API Wrapper when each document is updated during apply()
      var fakePut = _.clone(fakeResponse)
      fakePut.results[0].age = 15
      fakePut.results[1].age = 25

      var fakePutResponse = _.clone(fakePut)

      delete fakePut.results[0]._id
      delete fakePut.results[1]._id

      // Set up the http intercepts - we ask it to return the same document we passed in
      // because that's what'll happen anyway
      var putScope1 = nock(host).put(put + '/1', fakePut.results[0]).reply(200, { results: [ fakePutResponse.results[0] ] })
      var putScope2 = nock(host).put(put + '/2', fakePut.results[1]).reply(200, { results: [ fakePutResponse.results[1] ] })

      return wrapper
      .useVersion('1.0')
      .useDatabase('test')
      .in('collectionOne')
      .whereFieldIsEqualTo(field, value)
      .apply(function(document) {
        document.age += 5
        return document
      }).then(function (data) {
        data.should.eql(fakePutResponse.results)
      })
    })
  })

  describe('create', function () {
    it('should insert each document', function () {
      var host = options.uri + ':' + options.port
      var post = '/1.0/test/collectionOne'

      // Set up the http intercepts - we ask it to return the same document we passed in
      // because that's what'll happen anyway
      var postScope = nock(host).post(post, documents).reply(200, { results: [ fakeResponse.results ] })

      return wrapper
      .useVersion('1.0')
      .useDatabase('test')
      .in('collectionOne')
      .create(documents).then(function (data) {
        data.should.eql({ results: [ fakeResponse.results ] })
      })
    })
  })

  describe('delete', function () {
    it('should throw an error if no query is specified', function () {
      should.throws(function () {
        return wrapper
        .useVersion('1.0')
        .useDatabase('test')
        .in('collectionOne')
        .delete()
      })
    })

    it('should delete each document returned from the query', function () {

      var query = { query: { name: 'John Doe' } }
      var host = options.uri + ':' + options.port
      var del = '/1.0/test/collectionOne'

      // Prepare fake response bodies for the DELETE request inside API Wrapper
      var fakeDelete = _.clone(fakeResponse)

      // Set up the http intercepts - we ask it to return the same document we passed in
      // because that's what'll happen anyway
      var deleteScope1 = nock(host).delete(del, query).reply(204)

      return wrapper
      .useVersion('1.0')
      .useDatabase('test')
      .in('collectionOne')
      .whereFieldIsEqualTo(field, value)
      .delete().then(function (data) {
        should.not.exist(data)
      })
    })
  })

  describe('update', function () {
    it('should throw an error if no query is specified', function () {
      should.throws(function () {
        return wrapper
        .useVersion('1.0')
        .useDatabase('test')
        .in('collectionOne')
        .update()
      })
    })
  })

  describe('find', function () {
    beforeEach(function() {
    })

    it('should return the results array when extractResults is specified', function () {

      var query = { filter: JSON.stringify({ name: 'John' }) }
      var expectedQuerystring  = '?' + decodeURIComponent(querystring.stringify(query))
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
      var expectedQuerystring  = '?' + decodeURIComponent(querystring.stringify(query))
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
      var expectedQuerystring  = '?' + decodeURIComponent(querystring.stringify(query))
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
      var expectedQuerystring  = '?' + decodeURIComponent(querystring.stringify(query))
      var host = options.uri + ':' + options.port
      var urlPath = '/1.0/test/collectionOne/count' + expectedQuerystring

      var findScope = nock(host).get(urlPath).reply(200, fakeResponse.metadata)

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

  describe('getConfig', function (done) {
    afterEach(function () {
      apiWrapper.prototype._buildURL.restore()
    })

    it('should call buildUrl with {config:true}', function() {
      var host = options.uri + ':' + options.port
      var urlPath = '/1.0/test/collectionOne/config'
      var scope = nock(host).get(urlPath).reply(200)

      sinon.stub(apiWrapper.prototype, '_buildURL', function() {
        var args = arguments[0]
        args.should.eql({config:true})
        return this.options.uri + ':' + this.options.port + '/' + this.customVersion + '/' + this.customDatabase + '/' + this.collection + '/config'
      })

      return wrapper
        .useVersion('1.0')
        .useDatabase('test')
        .in('collectionOne')
        .getConfig().then().catch((err) => {
          throw err
        })
    })
  })

  describe('getStats', function () {
    afterEach(function () {
      apiWrapper.prototype._buildURL.restore()
    })

    it('should call buildUrl with {stats:true}', function() {
      var host = options.uri + ':' + options.port
      var urlPath = '/1.0/test/collectionOne/stats'
      var scope = nock(host).get(urlPath).reply(200)

      sinon.stub(apiWrapper.prototype, '_buildURL', function() {
        var args = arguments[0]
        args.should.eql({stats:true})
        return this.options.uri + ':' + this.options.port + '/' + this.customVersion + '/' + this.customDatabase + '/' + this.collection + '/stats'
      })

      return wrapper
        .useVersion('1.0')
        .useDatabase('test')
        .in('collectionOne')
        .getStats().then().catch((err) => {
          throw err
        })
    })
  })
})
