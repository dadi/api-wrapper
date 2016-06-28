var path = require('path')
var should = require('should')
var sinon = require('sinon')
var querystring = require('query-string')
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

  describe('Build URL', function () {

    it.skip('should use values from the options object', function (done) {
      var wrapperUrl = wrapper._buildURL()
      //console.log(wrapperUrl)
      var parsedUrl = url.parse(wrapperUrl)
      console.log(parsedUrl)
      parsedUrl.hostname.should.eql(options.uri)
      parsedUrl.port.should.eql(options.port)
      done()
    })

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

    it('should use version and endpoint if specified', function (done) {
      wrapper.useVersion('2.0').useDatabase('test').fromEndpoint('endpointOne')
      var wrapperUrl = wrapper._buildURL()
      wrapperUrl.should.eql('http://0.0.0.0:8000/2.0/endpointOne')
      done()
    })

    it('should append query to the querystring if specified', function (done) {
      var query = { filter: JSON.stringify({ name: 'John' }) }
      var expectedQuerystring  = '?' + querystring.stringify(query, {strict: false})

      wrapper.useVersion('1.0').useDatabase('test').in('collectionOne').whereFieldIsEqualTo('name', 'John')

      var wrapperUrl = wrapper._buildURL({useParams: true})
      wrapperUrl.should.eql('http://0.0.0.0:8000/1.0/test/collectionOne' + expectedQuerystring)
      done()
    })

    it('should append limit to the querystring if specified', function (done) {
      var query = { filter: JSON.stringify({ name: 'John' }), page: 33 }
      var expectedQuerystring  = '?' + querystring.stringify(query, {strict: false})

      wrapper.useVersion('1.0').useDatabase('test').in('collectionOne').whereFieldIsEqualTo('name', 'John').goToPage(33)

      var wrapperUrl = wrapper._buildURL({useParams: true})
      wrapperUrl.should.eql('http://0.0.0.0:8000/1.0/test/collectionOne' + expectedQuerystring)
      done()
    })

    it('should append limit to the querystring if specified', function (done) {
      var query = { count: 10, filter: JSON.stringify({ name: 'John' }) }
      var expectedQuerystring  = '?' + querystring.stringify(query, {strict: false})

      wrapper.useVersion('1.0').useDatabase('test').in('collectionOne').whereFieldIsEqualTo('name', 'John').limitTo(10)

      var wrapperUrl = wrapper._buildURL({useParams: true})
      wrapperUrl.should.eql('http://0.0.0.0:8000/1.0/test/collectionOne' + expectedQuerystring)
      done()
    })

    it('should not append limit to the querystring if a non-digit is specified', function (done) {
      var query = { filter: JSON.stringify({ name: 'John' }) }
      var expectedQuerystring  = '?' + querystring.stringify(query, {strict: false})

      wrapper.useVersion('1.0').useDatabase('test').in('collectionOne').whereFieldIsEqualTo('name', 'John').limitTo('name')

      var wrapperUrl = wrapper._buildURL({useParams: true})
      wrapperUrl.should.eql('http://0.0.0.0:8000/1.0/test/collectionOne' + expectedQuerystring)
      done()
    })

    it('should append sort to the querystring if specified', function (done) {
      var query = { filter: JSON.stringify({ name: 'John' }), sort: 'name', sortOrder: 'asc' }
      var expectedQuerystring  = '?' + querystring.stringify(query, {strict: false})

      wrapper.useVersion('1.0').useDatabase('test').in('collectionOne').whereFieldIsEqualTo('name', 'John').sortBy('name', 'asc')

      var wrapperUrl = wrapper._buildURL({useParams: true})
      wrapperUrl.should.eql('http://0.0.0.0:8000/1.0/test/collectionOne' + expectedQuerystring)
      done()
    })

    it('should append fields to the querystring if specified', function (done) {
      var query = { fields: JSON.stringify({ name: 1 }), filter: JSON.stringify({ name: 'John' }) }
      var expectedQuerystring  = '?' + querystring.stringify(query, {strict: false})

      wrapper.useVersion('1.0').useDatabase('test').in('collectionOne').whereFieldIsEqualTo('name', 'John').useFields(['name'])

      var wrapperUrl = wrapper._buildURL({useParams: true})
      wrapperUrl.should.eql('http://0.0.0.0:8000/1.0/test/collectionOne' + expectedQuerystring)
      done()
    })

    it('should append compose value to the querystring if specified', function (done) {
      var query = { compose: true, filter: JSON.stringify({ name: 'John' }) }
      var expectedQuerystring  = '?' + querystring.stringify(query, {strict: false})

      wrapper.useVersion('1.0').useDatabase('test').in('collectionOne').whereFieldIsEqualTo('name', 'John').withComposition(true)

      var wrapperUrl = wrapper._buildURL({useParams: true})
      wrapperUrl.should.eql('http://0.0.0.0:8000/1.0/test/collectionOne' + expectedQuerystring)
      done()
    })

    it('should append includeHistory value to the querystring if specified', function (done) {
      var query = { filter: JSON.stringify({ name: 'John' }), includeHistory: true }
      var expectedQuerystring  = '?' + querystring.stringify(query, {strict: false})

      wrapper.useVersion('1.0').useDatabase('test').in('collectionOne').whereFieldIsEqualTo('name', 'John').includeHistory(true)

      var wrapperUrl = wrapper._buildURL({useParams: true})
      wrapperUrl.should.eql('http://0.0.0.0:8000/1.0/test/collectionOne' + expectedQuerystring)
      done()
    })

  //
  // // it('should throw if no model is passed to constructor', function (done) {
  // //   controller.should.throw()
  // //   done()
  // // })
  // //
  // // it("should call the Model's find method", function (done) {
  // //   var mod = model('testModel', help.getModelSchema())
  // //   var stub = sinon.stub(mod, 'find')
  // //
  // //   var req = {
  // //     url: '/foo/bar'
  // //   }
  // //
  // //   controller(mod).get(req)
  // //   stub.callCount.should.equal(1)
  // //   stub.restore()
  // //   done()
  // // })
  // //
  // // it('should strip unknown params from the query', function (done) {
  // //   var mod = model('testModel', help.getModelSchema())
  // //   var stub = sinon.stub(mod, 'find')
  // //
  // //   var req = {
  // //     url: '/foo/bar?filter={"fieldName":"test", "busted":56488}'
  // //   }
  // //
  // //   controller(mod).get(req)
  // //   stub.callCount.should.equal(1)
  // //   var findArgs = stub.returnsArg(0).args[0][0]
  // //   findArgs.hasOwnProperty('busted').should.be.false
  // //   stub.restore()
  // //   done()
  // })
  })
})
