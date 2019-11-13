const mockery = require('mockery')
const nock = require('nock')
const path = require('path')
const querystring = require('querystring')
const should = require('should')
const sinon = require('sinon')
const url = require('url')
const _ = require('underscore')

const apiWrapper = require(__dirname + '/../../index')

let wrapper
const field = 'name'
const value = 'John Doe'
const matches = ['John', 'Jane']

const options = {
  uri: 'http://0.0.0.0',
  port: 8000,
  tokenUrl: '/token',
  credentials: {
    clientId: 'test',
    secret: 'secret'
  }
}

let tokenScope
let findScope
let fakeResponse

const documents = [
  {_id: 1, name: 'John'},
  {_id: 2, name: 'Jane'}
]

describe('Terminators', function(done) {
  before(function(done) {
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

  after(function(done) {
    // mockery.disable()
    // mockery.deregisterAll()
    done()
  })

  beforeEach(function() {
    wrapper = new apiWrapper(options)

    fakeResponse = {
      results: [
        {_id: 1, name: 'John'},
        {_id: 2, name: 'Jane'}
      ],
      metadata: {
        totalCount: 2
      }
    }

    tokenScope = nock(options.uri + ':' + options.port)
      .post(options.tokenUrl)
      .reply(200, {
        accessToken: 'd08c2efb-c0d6-446a-ba84-4a4199c9e0c5',
        tokenType: 'Bearer',
        expiresIn: 1800
      })
  })

  describe('apply', function() {
    it('should throw an error if no collection is specified', function() {
      should.throws(function() {
        return wrapper
          .inProperty('test')
          .whereFieldIsEqualTo(field, value)
          .apply(function() {})
      })
    })

    it('should throw an error if no query is specified', function() {
      should.throws(function() {
        return wrapper
          .inProperty('test')
          .in('collectionOne')
          .apply(function() {})
      })
    })

    it('should throw an error if no callback is passed', function() {
      should.throws(function() {
        return wrapper
          .inProperty('test')
          .in('collectionOne')
          .whereFieldIsEqualTo(field, value)
          .apply()
      })
    })

    it('should process each returned document using the callback', function() {
      const query = {filter: JSON.stringify({name: 'John Doe'})}
      const expectedQuerystring =
        '?' + querystring.stringify(query).replace('%3A', ':')
      const host = options.uri + ':' + options.port
      const get = '/test/collectionOne' + expectedQuerystring
      const put = '/test/collectionOne'

      // Prepare a fake response body for the GET request inside
      // API Wrapper
      const fakeGet = JSON.parse(JSON.stringify(fakeResponse))

      fakeGet.results[0].age = 10
      fakeGet.results[1].age = 20

      const findScope = nock(host)
        .get(get)
        .reply(200, fakeGet)

      // Prepare fake response bodies for the PUT request inside
      // API Wrapper when each document is updated during apply()
      const fakePut = JSON.parse(JSON.stringify(fakeResponse))

      fakePut.results[0].age = 15
      fakePut.results[1].age = 25

      const fakePutResponse = JSON.parse(JSON.stringify(fakePut))

      // Set up the http intercepts - we ask it to return the same document we passed in
      // because that's what'll happen anyway
      const putScope1 = nock(host)
        .put(put, {
          query: {_id: fakeResponse.results[0]._id},
          update: fakePut.results[0]
        })
        .reply(200, {results: [fakePutResponse.results[0]]})

      const putScope2 = nock(host)
        .put(put, {
          query: {_id: fakeResponse.results[1]._id},
          update: fakePut.results[1]
        })
        .reply(200, {results: [fakePutResponse.results[1]]})

      delete fakePut.results[0]._id
      delete fakePut.results[1]._id

      return wrapper
        .inProperty('test')
        .in('collectionOne')
        .whereFieldIsEqualTo(field, value)
        .apply(function(document) {
          document.age += 5

          return document
        })
        .then(function(data) {
          data.should.eql(fakePutResponse.results)
        })
    })
  })

  describe('create', function() {
    it('should insert each document', function() {
      const host = options.uri + ':' + options.port
      const post = '/test/collectionOne'

      // Set up the http intercepts - we ask it to return the same document we passed in
      // because that's what'll happen anyway
      delete documents[0]._id
      delete documents[1]._id
      const postScope = nock(host)
        .post(post, documents)
        .reply(200, {results: [fakeResponse.results]})

      return wrapper
        .inProperty('test')
        .in('collectionOne')
        .create(documents)
        .then(function(data) {
          data.should.eql({results: [fakeResponse.results]})
        })
    })
  })

  describe('delete', function() {
    it('should throw an error if no query is specified', function() {
      should.throws(function() {
        return wrapper
          .inProperty('test')
          .in('collectionOne')
          .delete()
      })
    })

    it('should delete each document returned from the query', function() {
      const query = {query: {name: 'John Doe'}}
      const host = options.uri + ':' + options.port
      const del = '/test/collectionOne'

      // Prepare fake response bodies for the DELETE request inside API Wrapper
      const fakeDelete = _.clone(fakeResponse)

      // Set up the http intercepts - we ask it to return the same document we passed in
      // because that's what'll happen anyway
      const deleteScope1 = nock(host)
        .delete(del, query)
        .reply(204)

      return wrapper
        .inProperty('test')
        .in('collectionOne')
        .whereFieldIsEqualTo(field, value)
        .delete()
        .then(function(data) {
          should.not.exist(data)
        })
    })
  })

  describe('update', function() {
    it('should throw an error if no query is specified', function() {
      should.throws(function() {
        return wrapper
          .inProperty('test')
          .in('collectionOne')
          .update()
      })
    })
  })

  describe('find', function() {
    beforeEach(function() {})

    it('should return the results array when extractResults is specified', function() {
      const query = {filter: JSON.stringify({name: 'John'})}
      const expectedQuerystring =
        '?' + querystring.stringify(query).replace('%3A', ':')
      const host = options.uri + ':' + options.port
      const urlPath = '/test/collectionOne' + expectedQuerystring

      const findScope = nock(host)
        .get(urlPath)
        .reply(200, fakeResponse)

      return wrapper
        .inProperty('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .find({extractResults: true})
        .then(function(data) {
          data.should.eql(fakeResponse.results)
        })
    })

    it('should return the full results object when extractResults is not specified', function() {
      const query = {filter: JSON.stringify({name: 'John'})}
      const expectedQuerystring =
        '?' + querystring.stringify(query).replace('%3A', ':')
      const host = options.uri + ':' + options.port
      const urlPath = '/test/collectionOne' + expectedQuerystring

      const findScope = nock(host)
        .get(urlPath)
        .reply(200, fakeResponse)

      return wrapper
        .inProperty('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .find()
        .then(function(data) {
          data.should.eql(fakeResponse)
        })
    })

    it('should return the full results object when extractResults = false', function() {
      const query = {filter: JSON.stringify({name: 'John'})}
      const expectedQuerystring =
        '?' + querystring.stringify(query).replace('%3A', ':')
      const host = options.uri + ':' + options.port
      const urlPath = '/test/collectionOne' + expectedQuerystring

      const findScope = nock(host)
        .get(urlPath)
        .reply(200, fakeResponse)

      return wrapper
        .inProperty('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .find({extractResults: false})
        .then(function(data) {
          data.should.eql(fakeResponse)
        })
    })

    it('should return the metadata object when extractMetadata = true', function() {
      const query = {filter: JSON.stringify({name: 'John'})}
      const expectedQuerystring =
        '?' + querystring.stringify(query).replace('%3A', ':')
      const host = options.uri + ':' + options.port
      const urlPath = '/test/collectionOne/count' + expectedQuerystring

      const findScope = nock(host)
        .get(urlPath)
        .reply(200, fakeResponse.metadata)

      return wrapper
        .inProperty('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .find({extractMetadata: true})
        .then(function(data) {
          data.should.eql(fakeResponse.metadata)
        })
    })
  })

  describe('getConfig', function(done) {
    afterEach(function() {
      apiWrapper.prototype._buildURL.restore()
    })

    it('should call buildUrl with {config:true}', function() {
      const host = options.uri + ':' + options.port
      const urlPath = '/test/collectionOne/config'
      const scope = nock(host)
        .get(urlPath)
        .reply(200)

      sinon.stub(apiWrapper.prototype, '_buildURL').callsFake(function() {
        const args = arguments[0]

        args.should.eql({config: true})

        return (
          this.options.uri +
          ':' +
          this.options.port +
          '/' +
          this.property +
          '/' +
          this.collection +
          '/config'
        )
      })

      return wrapper
        .inProperty('test')
        .in('collectionOne')
        .getConfig()
        .then()
        .catch(err => {
          throw err
        })
    })
  })

  describe('getStats', function() {
    afterEach(function() {
      apiWrapper.prototype._buildURL.restore()
    })

    it('should call buildUrl with {stats:true}', function() {
      const host = options.uri + ':' + options.port
      const urlPath = '/test/collectionOne/stats'
      const scope = nock(host)
        .get(urlPath)
        .reply(200)

      sinon.stub(apiWrapper.prototype, '_buildURL').callsFake(function() {
        const args = arguments[0]

        args.should.eql({stats: true})

        return (
          this.options.uri +
          ':' +
          this.options.port +
          '/' +
          this.property +
          '/' +
          this.collection +
          '/stats'
        )
      })

      return wrapper
        .inProperty('test')
        .in('collectionOne')
        .getStats()
        .then()
        .catch(err => {
          throw err
        })
    })
  })

  describe('getCollections', function() {
    afterEach(function() {
      apiWrapper.prototype._buildURL.restore()
    })

    it('should call buildUrl with {collections:true}', function() {
      const host = options.uri + ':' + options.port
      const urlPath = '/api/collections'
      const scope = nock(host)
        .get(urlPath)
        .reply(200)

      sinon.stub(apiWrapper.prototype, '_buildURL').callsFake(function() {
        const args = arguments[0]

        args.should.eql({collections: true})

        return this.options.uri + ':' + this.options.port + '/api/collections'
      })

      return wrapper
        .getCollections()
        .then()
        .catch(err => {
          throw err
        })
    })
  })
})
