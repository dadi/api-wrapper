const nock = require('nock')
const path = require('path')
const querystring = require('querystring')
const should = require('should')
const sinon = require('sinon')
const url = require('url')

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

describe('Helpers', function(done) {
  before(function(done) {
    done()
  })

  beforeEach(function() {
    wrapper = new apiWrapper(options)
  })

  describe('Build URL', function() {
    it('should use values from the options object', function(done) {
      const wrapperUrl = wrapper._buildURL()
      const parsedUrl = url.parse(wrapperUrl)

      parsedUrl.hostname.should.eql('0.0.0.0')
      parsedUrl.port.should.eql(options.port.toString())
      done()
    })

    it('should use customDatabase if specified', function(done) {
      wrapper.useDatabase('test').in('collectionOne')
      const wrapperUrl = wrapper._buildURL()

      wrapperUrl.should.eql('http://0.0.0.0:8000/test/collectionOne')
      done()
    })

    it('should use database if specified', function(done) {
      wrapper.useDatabase('test').in('collectionOne')
      const wrapperUrl = wrapper._buildURL()

      wrapperUrl.should.eql('http://0.0.0.0:8000/test/collectionOne')
      done()
    })

    it('should build /api url if no collection or endpoint specified', function(done) {
      wrapper.useDatabase('test')
      const wrapperUrl = wrapper._buildURL()

      wrapperUrl.should.eql('http://0.0.0.0:8000/api')
      done()
    })

    it('should accept database option when initialising', function(done) {
      options.database = 'test2'

      wrapper = new apiWrapper(options)
      wrapper
        .in('collectionOne')
        ._buildURL()
        .should.eql('http://0.0.0.0:8000/test2/collectionOne')
      done()
    })

    it('should use version and endpoint if specified', function(done) {
      wrapper
        .useVersion('2.0')
        .useDatabase('test')
        .fromEndpoint('endpointOne')
      const wrapperUrl = wrapper._buildURL()

      wrapperUrl.should.eql('http://0.0.0.0:8000/2.0/endpointOne')
      done()
    })

    it('should build /config url if option specified', function(done) {
      wrapper.useDatabase('test').in('collectionOne')
      const wrapperUrl = wrapper._buildURL({config: true})

      wrapperUrl.should.eql('http://0.0.0.0:8000/test/collectionOne/config')
      done()
    })

    it('should build /stats url if option specified', function(done) {
      wrapper.useDatabase('test').in('collectionOne')
      const wrapperUrl = wrapper._buildURL({stats: true})

      wrapperUrl.should.eql('http://0.0.0.0:8000/test/collectionOne/stats')
      done()
    })

    it('should build id url if option specified', function(done) {
      wrapper.useDatabase('test').in('collectionOne')
      const wrapperUrl = wrapper._buildURL({id: 123456})

      wrapperUrl.should.eql('http://0.0.0.0:8000/test/collectionOne/123456')
      done()
    })

    it('should append query to the querystring if specified', function(done) {
      const query = {filter: JSON.stringify({name: 'John'})}
      const expectedQuerystring =
        '?' + decodeURIComponent(querystring.stringify(query))

      wrapper
        .useDatabase('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')

      const wrapperUrl = wrapper._buildURL({useParams: true})

      wrapperUrl.should.eql(
        'http://0.0.0.0:8000/test/collectionOne' + expectedQuerystring
      )
      done()
    })

    it('should append page to the querystring if specified', function(done) {
      const query = {filter: JSON.stringify({name: 'John'}), page: 33}
      const expectedQuerystring =
        '?' + decodeURIComponent(querystring.stringify(query))

      wrapper
        .useDatabase('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .goToPage(33)

      const wrapperUrl = wrapper._buildURL({useParams: true})

      wrapperUrl.should.eql(
        'http://0.0.0.0:8000/test/collectionOne' + expectedQuerystring
      )
      done()
    })

    it('should append limit to the querystring if specified', function(done) {
      const query = {count: 10, filter: JSON.stringify({name: 'John'})}
      const expectedQuerystring =
        '?' + decodeURIComponent(querystring.stringify(query))

      wrapper
        .useDatabase('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .limitTo(10)

      const wrapperUrl = wrapper._buildURL({useParams: true})

      wrapperUrl.should.eql(
        'http://0.0.0.0:8000/test/collectionOne' + expectedQuerystring
      )
      done()
    })

    it('should not append limit to the querystring if a non-digit is specified', function(done) {
      const query = {filter: JSON.stringify({name: 'John'})}
      const expectedQuerystring =
        '?' + decodeURIComponent(querystring.stringify(query))

      wrapper
        .useDatabase('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .limitTo('name')

      const wrapperUrl = wrapper._buildURL({useParams: true})

      wrapperUrl.should.eql(
        'http://0.0.0.0:8000/test/collectionOne' + expectedQuerystring
      )
      done()
    })

    it('should append sort to the querystring if specified', function(done) {
      const query = {
        filter: JSON.stringify({name: 'John'}),
        sort: JSON.stringify({name: 1})
      }
      const expectedQuerystring =
        '?' + decodeURIComponent(querystring.stringify(query))

      wrapper
        .useDatabase('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .sortBy('name', 'asc')

      const wrapperUrl = wrapper._buildURL({useParams: true})

      wrapperUrl.should.eql(
        'http://0.0.0.0:8000/test/collectionOne' + expectedQuerystring
      )
      done()
    })

    it('should append fields to the querystring if specified', function(done) {
      const query = {
        fields: JSON.stringify({name: 1}),
        filter: JSON.stringify({name: 'John'})
      }
      const expectedQuerystring =
        '?' + decodeURIComponent(querystring.stringify(query))

      wrapper
        .useDatabase('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .useFields(['name'])

      const wrapperUrl = wrapper._buildURL({useParams: true})

      wrapperUrl.should.eql(
        'http://0.0.0.0:8000/test/collectionOne' + expectedQuerystring
      )
      done()
    })

    it('should append compose value to the querystring if specified and `true`', function(done) {
      const query = {compose: true, filter: JSON.stringify({name: 'John'})}
      const expectedQuerystring =
        '?' + decodeURIComponent(querystring.stringify(query))

      wrapper
        .useDatabase('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .withComposition(true)

      const wrapperUrl = wrapper._buildURL({useParams: true})

      wrapperUrl.should.eql(
        'http://0.0.0.0:8000/test/collectionOne' + expectedQuerystring
      )
      done()
    })

    it('should append compose value to the querystring if specified and `false`', function(done) {
      const query = {compose: false, filter: JSON.stringify({name: 'John'})}
      const expectedQuerystring =
        '?' + decodeURIComponent(querystring.stringify(query))

      wrapper
        .useDatabase('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .withComposition(false)

      const wrapperUrl = wrapper._buildURL({useParams: true})

      wrapperUrl.should.eql(
        'http://0.0.0.0:8000/test/collectionOne' + expectedQuerystring
      )
      done()
    })

    it('should append includeHistory value to the querystring if specified', function(done) {
      const query = {
        filter: JSON.stringify({name: 'John'}),
        includeHistory: true
      }
      const expectedQuerystring =
        '?' + decodeURIComponent(querystring.stringify(query))

      wrapper
        .useDatabase('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .includeHistory(true)

      const wrapperUrl = wrapper._buildURL({useParams: true})

      wrapperUrl.should.eql(
        'http://0.0.0.0:8000/test/collectionOne' + expectedQuerystring
      )
      done()
    })
  })

  describe('processRequest', function() {
    it('should refresh token if invalid_token response is received', function() {
      const host = options.uri + ':' + options.port

      nock(host)
        .get('/test/collectionOne')
        .reply(401, '', {
          'www-authenticate': 'error=invalid_token'
        })

      nock(host)
        .post('/token')
        .times(2)
        .reply(200, {
          accessToken: 'd08c2efb-c0d6-446a-ba84-4a4199c9e0c5',
          tokenType: 'Bearer',
          expiresIn: 1800
        })

      nock(host)
        .get('/test/collectionOne')
        .reply(200, {hello: 'world'})

      return wrapper
        .useDatabase('test')
        .in('collectionOne')
        .find()
        .then(function(data) {
          data.should.eql({hello: 'world'})
        })
    })
  })
})
