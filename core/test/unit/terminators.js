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

  describe('create', function() {
    it('should create the request object for creating the documents', function(done) {
      const query = {filter: JSON.stringify({name: 'John'}), page: 33}

      wrapper
        .inProperty('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .goToPage(33)

      const wrapperUrl = wrapper._buildURL({useParams: false})

      // Stripping `_id` out of `documents`
      const documentsCopy = [
        {name: documents[0].name},
        {name: documents[1].name}
      ]

      const requestObject = wrapper
        .inProperty('test')
        .in('collectionOne')
        .create(documents)

      requestObject.method.should.eql('POST')
      JSON.stringify(requestObject.body).should.eql(
        JSON.stringify(documentsCopy)
      )
      requestObject.uri.href.should.eql(wrapperUrl)

      done()
    })

    it('should create the request object for creating a client', function(done) {
      const client = {
        clientId: 'testClient',
        secret: 'superSecret'
      }

      const requestObject = wrapper.inClients().create(client)

      requestObject.method.should.eql('POST')
      requestObject.uri.href.should.eql(
        `${options.uri}:${options.port}/api/clients`
      )
      requestObject.body.should.eql(client)

      done()
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

    it('should create the request object for deleting each document from the query', function(done) {
      const query = {query: {name: 'John Doe'}}
      const expectedQuerystring = '?' + querystring.stringify(query)

      const requestObject = wrapper
        .inProperty('test')
        .in('collectionOne')
        .whereFieldIsEqualTo(field, value)
        .delete()

      const expectedUrl = wrapper._buildURL({useParams: false})

      requestObject.method.should.eql('DELETE')
      JSON.stringify(requestObject.body).should.eql(JSON.stringify(query))
      requestObject.uri.href.should.eql(expectedUrl)

      done()
    })

    it('should create the request object for deleting a client by ID', function(done) {
      const testClient = 'testClient'
      const requestObject = wrapper
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

    it('should throw an error when trying to delete a client and no filter is used', function() {
      should.throws(function() {
        return wrapper.inClients().delete()
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

    it('should create the request object for updating each document from the query', function(done) {
      const query = {query: {name: 'John Doe'}}

      const requestObject = wrapper
        .inProperty('test')
        .in('collectionOne')
        .whereFieldIsEqualTo(field, value)
        .update({name: 'Jane Doe'})

      const expectedUrl = wrapper._buildURL({useParams: false})

      requestObject.method.should.eql('PUT')
      requestObject.body.query.should.eql(query.query)
      requestObject.body.update.should.eql({name: 'Jane Doe'})
      requestObject.uri.href.should.eql(expectedUrl)

      done()
    })

    it('should create the request object for updating a client by ID', function(done) {
      const testClient = 'testClient'
      const update = {
        secret: 'newSecret',
        data: {
          foo: 'bar'
        }
      }
      const requestObject = wrapper
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

    it('should create the request object for updating the client associated with the bearer token', function(done) {
      const update = {
        secret: 'newSecret',
        data: {
          foo: 'bar'
        }
      }
      const requestObject = wrapper
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

    it('should throw an error when trying to update a client and no filter is used', function() {
      should.throws(function() {
        return wrapper.inClients().update({
          foo: 'bar'
        })
      })
    })
  })

  describe('find', function() {
    it('should create the request object for finding documents affected by the query', function(done) {
      const requestObject = wrapper
        .inProperty('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .find({extractResults: true})

      const expectedUrl = wrapper._buildURL({useParams: true})

      requestObject.method.should.eql('GET')
      should.not.exist(requestObject.body)
      requestObject.uri.href.should.eql(expectedUrl)

      done()
    })

    it('should create the request object for finding all clients', function(done) {
      const requestObject = wrapper.inClients().find()

      requestObject.method.should.eql('GET')
      requestObject.uri.href.should.eql(
        `${options.uri}:${options.port}/api/clients`
      )
      should.not.exist(requestObject.body)

      done()
    })

    it('should create the request object for finding a client by ID', function(done) {
      const testClient = 'testClient'
      const requestObject = wrapper
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

    it('should create the request object for finding the client associated with the bearer token', function(done) {
      const testClient = 'testClient'
      const requestObject = wrapper
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

  describe('getConfig', function(done) {
    it('should create the request object for getting a collection config', function(done) {
      const requestObject = wrapper
        .inProperty('test')
        .in('collectionOne')
        .getConfig()

      const expectedUrl = wrapper._buildURL({config: true})

      requestObject.method.should.eql('GET')
      should.not.exist(requestObject.body)
      requestObject.uri.href.should.eql(expectedUrl)

      done()
    })
  })

  describe('getLanguages', function(done) {
    it('should create the request object for getting the list of supported languages', function(done) {
      const requestObject = wrapper.getLanguages()
      const expectedUrl = wrapper._buildURL({languages: true})

      requestObject.method.should.eql('GET')
      should.not.exist(requestObject.body)
      requestObject.uri.href.should.eql(expectedUrl)

      done()
    })
  })

  describe('getStats', function(done) {
    it('should create the request object for getting collection stats', function(done) {
      const query = {filter: JSON.stringify({name: 'John'})}

      const requestObject = wrapper
        .inProperty('test')
        .in('collectionOne')
        .getStats()

      const expectedUrl = wrapper._buildURL({stats: true})

      requestObject.method.should.eql('GET')
      should.not.exist(requestObject.body)
      requestObject.uri.href.should.eql(expectedUrl)

      done()
    })
  })

  describe('getStatus', function(done) {
    it('should create the request object for getting the status endpoint', function(done) {
      const requestObject = wrapper.getStatus()

      const expectedUrl = wrapper._buildURL({status: true})

      requestObject.method.should.eql('POST')
      should.not.exist(requestObject.body)
      requestObject.uri.href.should.eql(expectedUrl)

      done()
    })
  })

  describe('search', function(done) {
    it('should create the request object for a collection search', function(done) {
      const requestObject = wrapper
        .inProperty('test')
        .in('collectionOne')
        .setSearchQuery('John')
        .find()

      const expectedUrl = wrapper._buildURL({
        useParams: true
      })

      requestObject.method.should.eql('GET')
      should.not.exist(requestObject.body)
      requestObject.uri.href.should.eql(expectedUrl)

      done()
    })
  })

  describe('getCollections', function(done) {
    it('should create the request object for getting the collections endpoint', function(done) {
      const requestObject = wrapper.getCollections()

      const expectedUrl = wrapper._buildURL({collections: true})

      requestObject.method.should.eql('GET')
      should.not.exist(requestObject.body)
      requestObject.uri.href.should.eql(expectedUrl)

      done()
    })
  })

  describe('getSignedUrl', function(done) {
    it('should create the request object for getting a signed URL', function(done) {
      const urlParameters = {
        fileName: 'foobar.jpg',
        mimetype: 'image/jpeg'
      }

      const requestObject = wrapper
        .inMedia('images')
        .getSignedUrl(urlParameters)

      const expectedUrl = wrapper._buildURL({signUrl: true})

      requestObject.method.should.eql('POST')
      requestObject.uri.href.should.eql(expectedUrl)
      JSON.stringify(requestObject.body).should.eql(
        JSON.stringify(urlParameters)
      )

      done()
    })
  })

  describe('callback option', function(done) {
    it('should run a callback on the request object before returning, when defined', function(done) {
      const optionsWithCallback = Object.assign({}, options, {
        callback: function stringifyRequestObject(requestObject) {
          return JSON.stringify(requestObject)
        }
      })

      const wrapperWithCallback = new apiWrapper(optionsWithCallback)

      const query = {filter: JSON.stringify({name: 'John'})}

      const requestObject = wrapper
        .inProperty('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .find({extractResults: true})

      const requestObjectWithCallback = wrapperWithCallback
        .inProperty('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .find({extractResults: true})

      JSON.stringify(requestObject).should.eql(requestObjectWithCallback)

      done()
    })
  })

  describe('hooks', function() {
    it('should create the request object for getting the list of hooks', function(done) {
      const requestObject = wrapper.inHooks().find()

      const expectedUrl = wrapper._buildURL()

      requestObject.method.should.eql('GET')
      requestObject.uri.href.should.eql(expectedUrl)

      done()
    })

    it('should create the request object for getting the source of a particular hook', function(done) {
      const requestObject = wrapper
        .inHooks()
        .whereHookNameIs('slugify')
        .find()

      const expectedUrl = wrapper._buildURL()

      requestObject.method.should.eql('GET')
      requestObject.uri.href.should.eql(expectedUrl)

      done()
    })

    it('should create the request object for updating a hook', function(done) {
      const hookSource = 'console.log("hello")'
      const requestObject = wrapper
        .inHooks()
        .whereHookNameIs('slugify')
        .update(hookSource)

      const expectedUrl = wrapper._buildURL()

      requestObject.body.should.eql(hookSource)
      requestObject.method.should.eql('PUT')
      requestObject.uri.href.should.eql(expectedUrl)
      requestObject.headers['content-type'].should.eql('text/plain')

      done()
    })

    it('should throw when trying to update a hook without specifying its name', function(done) {
      const requestObject = function() {
        wrapper.inHooks().update('console.log("hello")')
      }

      requestObject.should.throw()

      done()
    })

    it('should create the request object for creating a hook', function(done) {
      const hookSource = 'console.log("hello")'
      const requestObject = wrapper
        .inHooks()
        .whereHookNameIs('slugify')
        .create(hookSource)

      const expectedUrl = wrapper._buildURL()

      requestObject.body.should.eql(hookSource)
      requestObject.method.should.eql('POST')
      requestObject.uri.href.should.eql(expectedUrl)
      requestObject.headers['content-type'].should.eql('text/plain')

      done()
    })

    it('should throw when trying to create a hook without specifying its name', function(done) {
      const requestObject = function() {
        wrapper.inHooks().create('console.log("hello")')
      }

      requestObject.should.throw()

      done()
    })

    it('should create the request object for deleting a hook', function(done) {
      const requestObject = wrapper
        .inHooks()
        .whereHookNameIs('slugify')
        .delete()

      const expectedUrl = wrapper._buildURL()

      requestObject.method.should.eql('DELETE')
      requestObject.uri.href.should.eql(expectedUrl)

      done()
    })
  })
})
