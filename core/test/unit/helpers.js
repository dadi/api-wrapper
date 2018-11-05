var path = require('path')
var should = require('should')
var sinon = require('sinon')
var querystring = require('querystring')
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

describe('Helpers', function (done) {
  before(function (done) {
    done()
  })

  beforeEach(function () {
    wrapper = new apiWrapper(options)
  })

  describe('_reset', function () {
    it('should reset internal properties', function (done) {
      wrapper.useVersion('2.0').useDatabase('test')
      wrapper.customVersion.should.eql('2.0')
      wrapper._reset()
      should.not.exist(wrapper.customVersion)
      done()
    })
  })

  describe('_stripReservedProperties', function () {
    it('should remove internal properties', function (done) {
      var document = {
        apiVersion: '1.0',
        createdBy: 'test',
        v: 1,
        name: 'John'
      }

      document = wrapper._stripReservedProperties(document)
      should.not.exist(document.v)
      should.not.exist(document.apiVersion)
      should.not.exist(document.createdBy)
      done()
    })
  })

  describe('Build URL', function () {
    it('should use values from the options object', function (done) {
      var wrapperUrl = wrapper._buildURL()
      var parsedUrl = url.parse(wrapperUrl)
      var parsedOptionsUri = url.parse(options.uri)
      parsedUrl.hostname.should.eql(parsedOptionsUri.hostname)
      parsedUrl.port.should.eql(options.port.toString())
      done()
    })

    // TODO: use a default version if none specified?
    it.skip('should use customDatabase if specified', function (done) {
      wrapper.useDatabase('test').in('collectionOne')
      var wrapperUrl = wrapper._buildURL()
      wrapperUrl.should.eql('http://0.0.0.0:8000/1.0/test/collectionOne')
      done()
    })

    it('should use version and database if specified', function (done) {
      wrapper.useVersion('2.0').useDatabase('test').in('collectionOne')
      var wrapperUrl = wrapper._buildURL()
      wrapperUrl.should.eql('http://0.0.0.0:8000/2.0/test/collectionOne')
      done()
    })

    it('should build /api url if no collection or endpoint specified', function (done) {
      wrapper.useVersion('2.0').useDatabase('test')
      var wrapperUrl = wrapper._buildURL()
      wrapperUrl.should.eql('http://0.0.0.0:8000/api')
      done()
    })

    it('should accept database and version options when initialising', function (done) {
      options.version = '2.4'
      options.database = 'test2'

      wrapper = new apiWrapper(options)
      wrapper.in('collectionOne')._buildURL().should.eql('http://0.0.0.0:8000/2.4/test2/collectionOne')
      done()
    })

    it('should use version and endpoint if specified', function (done) {
      wrapper.useVersion('2.0').useDatabase('test').fromEndpoint('endpointOne')
      var wrapperUrl = wrapper._buildURL()
      wrapperUrl.should.eql('http://0.0.0.0:8000/2.0/endpointOne')
      done()
    })

    it('should build /status url if option specified', function (done) {
      var wrapperUrl = wrapper._buildURL({status:true})
      wrapperUrl.should.eql('http://0.0.0.0:8000/api/status')
      done()
    })

    it('should build /collections url if option specified', function (done) {
      var wrapperUrl = wrapper._buildURL({collections:true})
      wrapperUrl.should.eql('http://0.0.0.0:8000/api/collections')
      done()
    })

    it('should build /count url if extractMetadata option specified', function (done) {
      wrapper.useVersion('2.0').useDatabase('test').in('collectionOne')
      var wrapperResult = wrapper.find({extractMetadata:true})
      wrapperResult.uri.href.should.eql('http://0.0.0.0:8000/2.0/test/collectionOne/count')
      done()
    })

    it('should build /config url if option specified', function (done) {
      wrapper.useVersion('2.0').useDatabase('test').in('collectionOne')
      var wrapperUrl = wrapper._buildURL({config:true})
      wrapperUrl.should.eql('http://0.0.0.0:8000/2.0/test/collectionOne/config')
      done()
    })

    it('should build /stats url if option specified', function (done) {
      wrapper.useVersion('2.0').useDatabase('test').in('collectionOne')
      var wrapperUrl = wrapper._buildURL({stats:true})
      wrapperUrl.should.eql('http://0.0.0.0:8000/2.0/test/collectionOne/stats')
      done()
    })

    it('should build id url if option specified', function (done) {
      wrapper.useVersion('2.0').useDatabase('test').in('collectionOne')
      var wrapperUrl = wrapper._buildURL({id:123456})
      wrapperUrl.should.eql('http://0.0.0.0:8000/2.0/test/collectionOne/123456')
      done()
    })

    it('should append query to the querystring if specified', function (done) {
      var query = { filter: JSON.stringify({ name: 'John' }) }
      var expectedQuerystring  = '?' + decodeURIComponent(querystring.stringify(query))

      wrapper.useVersion('1.0').useDatabase('test').in('collectionOne').whereFieldIsEqualTo('name', 'John')

      var wrapperUrl = wrapper._buildURL({useParams: true})
      wrapperUrl.should.eql('http://0.0.0.0:8000/1.0/test/collectionOne' + expectedQuerystring)
      done()
    })

    it('should append page to the querystring if specified', function (done) {
      var query = { filter: JSON.stringify({ name: 'John' }), page: 33 }
      var expectedQuerystring  = '?' + decodeURIComponent(querystring.stringify(query))

      wrapper.useVersion('1.0').useDatabase('test').in('collectionOne').whereFieldIsEqualTo('name', 'John').goToPage(33)

      var wrapperUrl = wrapper._buildURL({useParams: true})
      wrapperUrl.should.eql('http://0.0.0.0:8000/1.0/test/collectionOne' + expectedQuerystring)
      done()
    })

    it('should append limit to the querystring if specified', function (done) {
      var query = { count: 10, filter: JSON.stringify({ name: 'John' }) }
      var expectedQuerystring  = '?' + decodeURIComponent(querystring.stringify(query))

      wrapper.useVersion('1.0').useDatabase('test').in('collectionOne').whereFieldIsEqualTo('name', 'John').limitTo(10)

      var wrapperUrl = wrapper._buildURL({useParams: true})
      wrapperUrl.should.eql('http://0.0.0.0:8000/1.0/test/collectionOne' + expectedQuerystring)
      done()
    })

    it('should not append limit to the querystring if a non-digit is specified', function (done) {
      var query = { filter: JSON.stringify({ name: 'John' }) }
      var expectedQuerystring  = '?' + decodeURIComponent(querystring.stringify(query))

      wrapper.useVersion('1.0').useDatabase('test').in('collectionOne').whereFieldIsEqualTo('name', 'John').limitTo('name')

      var wrapperUrl = wrapper._buildURL({useParams: true})
      wrapperUrl.should.eql('http://0.0.0.0:8000/1.0/test/collectionOne' + expectedQuerystring)
      done()
    })

    it('should append sort to the querystring if specified', function (done) {
      var query = { filter: JSON.stringify({ name: 'John' }), sort: JSON.stringify({ name: 1 }) }
      var expectedQuerystring  = '?' + decodeURIComponent(querystring.stringify(query))

      wrapper.useVersion('1.0').useDatabase('test').in('collectionOne').whereFieldIsEqualTo('name', 'John').sortBy('name', 'asc')

      var wrapperUrl = wrapper._buildURL({useParams: true})
      wrapperUrl.should.eql('http://0.0.0.0:8000/1.0/test/collectionOne' + expectedQuerystring)
      done()
    })

    it('should append fields to the querystring if specified', function (done) {
      var query = { fields: JSON.stringify({ name: 1 }), filter: JSON.stringify({ name: 'John' }) }
      var expectedQuerystring  = '?' + decodeURIComponent(querystring.stringify(query))

      wrapper.useVersion('1.0').useDatabase('test').in('collectionOne').whereFieldIsEqualTo('name', 'John').useFields(['name'])

      var wrapperUrl = wrapper._buildURL({useParams: true})

      wrapperUrl.should.eql('http://0.0.0.0:8000/1.0/test/collectionOne' + expectedQuerystring)
      done()
    })

    it('should append compose value to the querystring if specified and `true`', function (done) {
      var query = { compose: true, filter: JSON.stringify({ name: 'John' }) }
      var expectedQuerystring  = '?' + decodeURIComponent(querystring.stringify(query))

      wrapper.useVersion('1.0').useDatabase('test').in('collectionOne').whereFieldIsEqualTo('name', 'John').withComposition(true)

      var wrapperUrl = wrapper._buildURL({useParams: true})

      wrapperUrl.should.eql('http://0.0.0.0:8000/1.0/test/collectionOne' + expectedQuerystring)
      done()
    })

    it('should append compose value to the querystring if specified and `false`', function (done) {
      var query = { compose: false, filter: JSON.stringify({ name: 'John' }) }
      var expectedQuerystring  = '?' + decodeURIComponent(querystring.stringify(query))

      wrapper.useVersion('1.0').useDatabase('test').in('collectionOne').whereFieldIsEqualTo('name', 'John').withComposition(false)

      var wrapperUrl = wrapper._buildURL({useParams: true})
      wrapperUrl.should.eql('http://0.0.0.0:8000/1.0/test/collectionOne' + expectedQuerystring)
      done()
    })

    it('should append includeHistory value to the querystring if specified', function (done) {
      var query = { filter: JSON.stringify({ name: 'John' }), includeHistory: true }
      var expectedQuerystring  = '?' + decodeURIComponent(querystring.stringify(query))

      wrapper.useVersion('1.0').useDatabase('test').in('collectionOne').whereFieldIsEqualTo('name', 'John').includeHistory(true)

      var wrapperUrl = wrapper._buildURL({useParams: true})
      wrapperUrl.should.eql('http://0.0.0.0:8000/1.0/test/collectionOne' + expectedQuerystring)
      done()
    })

    it('should URL encode filter values', function (done) {
      wrapper
        .useVersion('1.0')
        .useDatabase('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('email', 'john+doe@somedomain.tech')
        .useFields(['email'])

      var wrapperUrl = wrapper._buildURL({useParams: true})

      wrapperUrl.should.eql(
        `http://0.0.0.0:8000/1.0/test/collectionOne?fields={"email":1}&filter={"email":"${encodeURIComponent('john+doe@somedomain.tech')}"}`
      )

      done()
    })

    it('should URL encode nested filter values', function (done) {
      wrapper
        .useVersion('1.0')
        .useDatabase('test')
        .in('collectionOne')
        .whereFieldContains('email', 'john+doe@somedomain.tech')
        .useFields(['email'])

      var wrapperUrl = wrapper._buildURL({useParams: true})

      wrapperUrl.should.eql(
        `http://0.0.0.0:8000/1.0/test/collectionOne?fields={"email":1}&filter={"email":{"$regex":"${encodeURIComponent('john+doe@somedomain.tech')}"}}`
      )

      done()
    })

    it('should not URL encode non-string values', function (done) {
      wrapper
        .useVersion('1.0')
        .useDatabase('test')
        .in('collectionOne')
        .whereFieldIsGreaterThan('email', 1000)
        .useFields(['email'])

      var wrapperUrl = wrapper._buildURL({useParams: true})

      wrapperUrl.should.eql(
        `http://0.0.0.0:8000/1.0/test/collectionOne?fields={"email":1}&filter={"email":{"$gt":1000}}`
      )

      done()
    })
  })
})
