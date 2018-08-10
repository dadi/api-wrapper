var mockery = require('mockery')
var nock = require('nock')
var path = require('path')
var querystring = require('querystring')
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

  describe('create', function () {
    it('should create the request object for creating the documents', function (done) {
      var query = { filter: JSON.stringify({ name: 'John' }), page: 33 }
      var expectedQuerystring  = '?' + querystring.stringify(query)

      wrapper.useVersion('1.0')
             .useDatabase('test')
             .in('collectionOne')
             .whereFieldIsEqualTo('name', 'John')
             .goToPage(33)

      var wrapperUrl = wrapper._buildURL({useParams: false})

      // Stripping `_id` out of `documents`
      var documentsCopy = [
        {name: documents[0].name},
        {name: documents[1].name}
      ]

      var requestObject = wrapper
        .useVersion('1.0')
        .useDatabase('test')
        .in('collectionOne')
        .create(documents)

      requestObject.method.should.eql('POST')
      JSON.stringify(requestObject.body).should.eql(JSON.stringify(documentsCopy))
      requestObject.uri.href.should.eql(wrapperUrl)

      done()
    })

    it('should create the request object for creating a client', function (done) {
      var client = {
        clientId: 'testClient',
        secret: 'superSecret'
      }

      var requestObject = wrapper
        .inClients()
        .create(client)

      requestObject.method.should.eql('POST')
      requestObject.uri.href.should.eql(
        `${options.uri}:${options.port}/api/clients`
      )
      requestObject.body.should.eql(client)

      done()
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

    it('should create the request object for deleting each document from the query', function (done) {
      var query = { query: { name: 'John Doe' } }
      var expectedQuerystring  = '?' + querystring.stringify(query)

      var requestObject = wrapper.useVersion('1.0')
                                 .useDatabase('test')
                                 .in('collectionOne')
                                 .whereFieldIsEqualTo(field, value)
                                 .delete()

      var expectedUrl = wrapper._buildURL({useParams: false})

      requestObject.method.should.eql('DELETE')
      JSON.stringify(requestObject.body).should.eql(JSON.stringify(query))
      requestObject.uri.href.should.eql(expectedUrl)

      done()
    })

    it('should create the request object for deleting a client by ID', function (done) {
      var testClient = 'testClient'
      var requestObject = wrapper
        .inClients()
        .whereClientIs(testClient)
        .delete()

      requestObject.method.should.eql('DELETE')
      requestObject.uri.href.should.eql(
        `${options.uri}:${options.port}/api/clients/${testClient}`
      )
      should.not.exist(requestObject.body)

      done()
    })

    it('should throw an error when trying to delete a client and no filter is used', function () {
      should.throws(function () {
        return wrapper
        .inClients()
        .delete()
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

    it('should create the request object for updating each document from the query', function (done) {
      var query = { query: { name: 'John Doe' } }
      var expectedQuerystring  = '?' + querystring.stringify(query)

      var requestObject = wrapper.useVersion('1.0')
                                 .useDatabase('test')
                                 .in('collectionOne')
                                 .whereFieldIsEqualTo(field, value)
                                 .update({ name: 'Jane Doe' })

      var expectedUrl = wrapper._buildURL({useParams: false})

      requestObject.method.should.eql('PUT')
      requestObject.body.query.should.eql(query.query)
      requestObject.body.update.should.eql({ name: 'Jane Doe' })
      requestObject.uri.href.should.eql(expectedUrl)

      done()
    })

    it('should create the request object for updating a client by ID', function (done) {
      var testClient = 'testClient'
      var update = {
        secret: 'newSecret',
        data: {
          foo: 'bar'
        }
      }
      var requestObject = wrapper
        .inClients()
        .whereClientIs(testClient)
        .update(update)

      requestObject.method.should.eql('PUT')
      requestObject.uri.href.should.eql(
        `${options.uri}:${options.port}/api/clients/${testClient}`
      )
      requestObject.body.should.eql(update)

      done()
    })

    it('should create the request object for updating the client associated with the bearer token', function (done) {
      var update = {
        secret: 'newSecret',
        data: {
          foo: 'bar'
        }
      }
      var requestObject = wrapper
        .inClients()
        .whereClientIsSelf()
        .update(update)

      requestObject.method.should.eql('PUT')
      requestObject.uri.href.should.eql(
        `${options.uri}:${options.port}/api/client`
      )
      requestObject.body.should.eql(update)

      done()
    })

    it('should throw an error when trying to update a client and no filter is used', function () {
      should.throws(function () {
        return wrapper
        .inClients()
        .update({
          foo: 'bar'
        })
      })
    })
  })

  describe('find', function () {
    it('should create the request object for finding documents affected by the query', function (done) {
      var query = { filter: JSON.stringify({ name: 'John' }) }

      var requestObject = wrapper
        .useVersion('1.0')
        .useDatabase('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .find({extractResults: true})

      var expectedUrl = wrapper._buildURL({useParams: true})

      requestObject.method.should.eql('GET')
      should.not.exist(requestObject.body)
      requestObject.uri.href.should.eql(expectedUrl)

      done()
    })

    it('should create the request object for finding all clients', function (done) {
      var requestObject = wrapper
        .inClients()
        .find()

      requestObject.method.should.eql('GET')
      requestObject.uri.href.should.eql(
        `${options.uri}:${options.port}/api/clients`
      )
      should.not.exist(requestObject.body)

      done()
    })

    it('should create the request object for finding a client by ID', function (done) {
      var testClient = 'testClient'
      var requestObject = wrapper
        .inClients()
        .whereClientIs(testClient)
        .find()

      requestObject.method.should.eql('GET')
      requestObject.uri.href.should.eql(
        `${options.uri}:${options.port}/api/clients/${testClient}`
      )
      should.not.exist(requestObject.body)

      done()
    })

    it('should create the request object for finding the client associated with the bearer token', function (done) {
      var testClient = 'testClient'
      var requestObject = wrapper
        .inClients()
        .whereClientIsSelf()
        .find()

      requestObject.method.should.eql('GET')
      requestObject.uri.href.should.eql(
        `${options.uri}:${options.port}/api/client`
      )
      should.not.exist(requestObject.body)

      done()
    })
  })

  describe('getConfig', function (done) {
    it('should create the request object for getting a collection config', function (done) {
      var requestObject = wrapper
        .useVersion('1.0')
        .useDatabase('test')
        .in('collectionOne')
        .getConfig()

      var expectedUrl = wrapper._buildURL({config: true})

      requestObject.method.should.eql('GET')
      should.not.exist(requestObject.body)
      requestObject.uri.href.should.eql(expectedUrl)

      done()
    })
  })

  describe('getStats', function (done) {
    it('should create the request object for getting collection stats', function (done) {
      var query = { filter: JSON.stringify({ name: 'John' }) }

      var requestObject = wrapper
        .useVersion('1.0')
        .useDatabase('test')
        .in('collectionOne')
        .getStats()

      var expectedUrl = wrapper._buildURL({stats: true})

      requestObject.method.should.eql('GET')
      should.not.exist(requestObject.body)
      requestObject.uri.href.should.eql(expectedUrl)

      done()
    })
  })

  describe('getStatus', function (done) {
    it('should create the request object for getting the status endpoint', function (done) {
      var requestObject = wrapper
        .getStatus()

      var expectedUrl = wrapper._buildURL({status: true})

      requestObject.method.should.eql('POST')
      should.not.exist(requestObject.body)
      requestObject.uri.href.should.eql(expectedUrl)

      done()
    })
  })

  describe('getCollections', function (done) {
    it('should create the request object for getting the collections endpoint', function (done) {
      var requestObject = wrapper
        .getCollections()

      var expectedUrl = wrapper._buildURL({collections: true})

      requestObject.method.should.eql('GET')
      should.not.exist(requestObject.body)
      requestObject.uri.href.should.eql(expectedUrl)

      done()
    })
  })

  describe('getSignedUrl', function (done) {
    it('should create the request object for getting a signed URL', function (done) {
      var urlParameters = {
        fileName: 'foobar.jpg',
        mimetype: 'image/jpeg'
      }

      var requestObject = wrapper
        .inMedia('images')
        .getSignedUrl(urlParameters)

      var expectedUrl = wrapper._buildURL({signUrl: true})

      requestObject.method.should.eql('POST')
      requestObject.uri.href.should.eql(expectedUrl)
      JSON.stringify(requestObject.body).should.eql(JSON.stringify(urlParameters))

      done()
    })
  })

  describe('callback option', function (done) {
    it('should run a callback on the request object before returning, when defined', function (done) {
      var optionsWithCallback = Object.assign({}, options, {
        callback: function stringifyRequestObject (requestObject) {
          return JSON.stringify(requestObject)
        }
      })

      var wrapperWithCallback = new apiWrapper(optionsWithCallback)

      var query = { filter: JSON.stringify({ name: 'John' }) }

      var requestObject = wrapper
        .useVersion('1.0')
        .useDatabase('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .find({extractResults: true})

      var requestObjectWithCallback = wrapperWithCallback
        .useVersion('1.0')
        .useDatabase('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .find({extractResults: true})

      JSON.stringify(requestObject).should.eql(requestObjectWithCallback)

      done()
    })
  })

  describe('hooks', function () {
    it('should create the request object for getting the list of hooks', function (done) {
      var requestObject = wrapper
        .inHooks()
        .find()

      var expectedUrl = wrapper._buildURL()

      requestObject.method.should.eql('GET')
      requestObject.uri.href.should.eql(expectedUrl)

      done()
    })

    it('should create the request object for getting the source of a particular hook', function (done) {
      var requestObject = wrapper
        .inHooks()
        .whereHookNameIs('slugify')
        .find()

      var expectedUrl = wrapper._buildURL()

      requestObject.method.should.eql('GET')
      requestObject.uri.href.should.eql(expectedUrl)

      done()
    })

    it('should create the request object for updating a hook', function (done) {
      var hookSource = 'console.log("hello")'
      var requestObject = wrapper
        .inHooks()
        .whereHookNameIs('slugify')
        .update(hookSource)

      var expectedUrl = wrapper._buildURL()

      requestObject.body.should.eql(hookSource)
      requestObject.method.should.eql('PUT')
      requestObject.uri.href.should.eql(expectedUrl)
      requestObject.headers['content-type'].should.eql('text/plain')

      done()
    })

    it('should throw when trying to update a hook without specifying its name', function (done) {
      var requestObject = (function () {
        wrapper
          .inHooks()
          .update('console.log("hello")')        
      })

      requestObject.should.throw()

      done()
    })

    it('should create the request object for creating a hook', function (done) {
      var hookSource = 'console.log("hello")'
      var requestObject = wrapper
        .inHooks()
        .whereHookNameIs('slugify')
        .create(hookSource)

      var expectedUrl = wrapper._buildURL()

      requestObject.body.should.eql(hookSource)
      requestObject.method.should.eql('POST')
      requestObject.uri.href.should.eql(expectedUrl)
      requestObject.headers['content-type'].should.eql('text/plain')

      done()
    })

    it('should throw when trying to create a hook without specifying its name', function (done) {
      var requestObject = (function () {
        wrapper
          .inHooks()
          .create('console.log("hello")')        
      })

      requestObject.should.throw()

      done()
    })

    it('should create the request object for deleting a hook', function (done) {
      var requestObject = wrapper
        .inHooks()
        .whereHookNameIs('slugify')
        .delete()

      var expectedUrl = wrapper._buildURL()

      requestObject.method.should.eql('DELETE')
      requestObject.uri.href.should.eql(expectedUrl)

      done()
    })
  })  
})
