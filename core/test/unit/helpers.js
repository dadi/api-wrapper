const should = require('should')
const querystring = require('querystring')
const url = require('url')

const apiWrapper = require(__dirname + '/../../index')

let wrapper

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

  describe.skip('_reset', function() {
    it('should reset internal properties', function(done) {
      wrapper.useVersion('2.0').inProperty('test')
      wrapper.customVersion.should.eql('2.0')
      wrapper._reset()
      should.not.exist(wrapper.customVersion)
      done()
    })
  })

  describe('_stripReservedProperties', function() {
    it('should remove internal properties', function(done) {
      let document = {
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

  describe('Build URL', function() {
    it('should use values from the options object', function(done) {
      const wrapperUrl = wrapper._buildURL()
      const parsedUrl = url.parse(wrapperUrl)
      const parsedOptionsUri = url.parse(options.uri)

      parsedUrl.hostname.should.eql(parsedOptionsUri.hostname)
      parsedUrl.port.should.eql(options.port.toString())
      done()
    })

    // TODO: use a default version if none specified?
    it.skip('should use property if specified', function(done) {
      wrapper.inProperty('test').in('collectionOne')
      const wrapperUrl = wrapper._buildURL()

      wrapperUrl.should.eql('http://0.0.0.0:8000/test/collectionOne')
      done()
    })

    it('should use version and database if specified', function(done) {
      wrapper.inProperty('test').in('collectionOne')
      const wrapperUrl = wrapper._buildURL()

      wrapperUrl.should.eql('http://0.0.0.0:8000/test/collectionOne')
      done()
    })

    it('should build /api url if no collection or endpoint specified', function(done) {
      wrapper.useVersion('2.0').inProperty('test')
      const wrapperUrl = wrapper._buildURL()

      wrapperUrl.should.eql('http://0.0.0.0:8000/api')
      done()
    })

    it('should accept database and version options when initialising', function(done) {
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
        .inProperty('test')
        .fromEndpoint('endpointOne')
      const wrapperUrl = wrapper._buildURL()

      wrapperUrl.should.eql('http://0.0.0.0:8000/2.0/endpointOne')
      done()
    })

    it('should build /status url if option specified', function(done) {
      const wrapperUrl = wrapper._buildURL({status: true})

      wrapperUrl.should.eql('http://0.0.0.0:8000/api/status')
      done()
    })

    it('should build /collections url if option specified', function(done) {
      const wrapperUrl = wrapper._buildURL({collections: true})

      wrapperUrl.should.eql('http://0.0.0.0:8000/api/collections')
      done()
    })

    it('should build /count url if extractMetadata option specified', function(done) {
      wrapper.inProperty('test').in('collectionOne')
      const wrapperResult = wrapper.find({extractMetadata: true})

      wrapperResult.uri.href.should.eql(
        'http://0.0.0.0:8000/test/collectionOne/count'
      )
      done()
    })

    it('should build /config url if option specified', function(done) {
      wrapper.inProperty('test').in('collectionOne')
      const wrapperUrl = wrapper._buildURL({config: true})

      wrapperUrl.should.eql('http://0.0.0.0:8000/test/collectionOne/config')
      done()
    })

    it('should build /stats url if option specified', function(done) {
      wrapper.inProperty('test').in('collectionOne')
      const wrapperUrl = wrapper._buildURL({stats: true})

      wrapperUrl.should.eql('http://0.0.0.0:8000/test/collectionOne/stats')
      done()
    })

    it('should build id url if option specified', function(done) {
      wrapper.inProperty('test').in('collectionOne')
      const wrapperUrl = wrapper._buildURL({id: 123456})

      wrapperUrl.should.eql('http://0.0.0.0:8000/test/collectionOne/123456')
      done()
    })

    it('should append query to the querystring if specified', function(done) {
      const query = {filter: JSON.stringify({name: 'John'})}
      const expectedQuerystring =
        '?' + decodeURIComponent(querystring.stringify(query))

      wrapper
        .inProperty('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')

      const wrapperUrl = wrapper._buildURL({useParams: true})

      wrapperUrl.should.eql(
        'http://0.0.0.0:8000/test/collectionOne' + expectedQuerystring
      )
      done()
    })

    it('should append lang to the querystring if specified', function(done) {
      const query = {count: 10, filter: JSON.stringify({name: 'John'})}
      const expectedQuerystring =
        '?' + decodeURIComponent(querystring.stringify(query)) + '&lang=fr'

      wrapper
        .inProperty('test')
        .useLanguage('fr')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .limitTo(10)

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
        .inProperty('test')
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
        .inProperty('test')
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
        .inProperty('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .limitTo('name')

      const wrapperUrl = wrapper._buildURL({useParams: true})

      wrapperUrl.should.eql(
        'http://0.0.0.0:8000/test/collectionOne' + expectedQuerystring
      )
      done()
    })

    it('should set the search query', function(done) {
      const query = 'John'
      const expectedQuerystring = '?q=' + query

      wrapper
        .inProperty('test')
        .in('collectionOne')
        .setSearchQuery('John')

      const wrapperUrl = wrapper._buildURL({useParams: true})

      wrapperUrl.should.eql(
        'http://0.0.0.0:8000/test/collectionOne/search' + expectedQuerystring
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
        .inProperty('test')
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
        .inProperty('test')
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
        .inProperty('test')
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
        .inProperty('test')
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
        .inProperty('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('name', 'John')
        .includeHistory(true)

      const wrapperUrl = wrapper._buildURL({useParams: true})

      wrapperUrl.should.eql(
        'http://0.0.0.0:8000/test/collectionOne' + expectedQuerystring
      )
      done()
    })

    it('should URL encode filter values', function(done) {
      wrapper
        .inProperty('test')
        .in('collectionOne')
        .whereFieldIsEqualTo('email', 'john+doe@somedomain.tech')
        .useFields(['email'])

      const wrapperUrl = wrapper._buildURL({useParams: true})

      wrapperUrl.should.eql(
        `http://0.0.0.0:8000/test/collectionOne?fields={"email":1}&filter={"email":"${encodeURIComponent(
          'john+doe@somedomain.tech'
        )}"}`
      )

      done()
    })

    it('should URL encode nested filter values', function(done) {
      wrapper
        .inProperty('test')
        .in('collectionOne')
        .whereFieldContains('email', 'john+doe@somedomain.tech')
        .useFields(['email'])

      const wrapperUrl = wrapper._buildURL({useParams: true})

      wrapperUrl.should.eql(
        `http://0.0.0.0:8000/test/collectionOne?fields={"email":1}&filter={"email":{"$regex":"${encodeURIComponent(
          'john+doe@somedomain.tech'
        )}"}}`
      )

      done()
    })

    it('should not URL encode non-string values', function(done) {
      wrapper
        .inProperty('test')
        .in('collectionOne')
        .whereFieldIsGreaterThan('email', 1000)
        .useFields(['email'])

      const wrapperUrl = wrapper._buildURL({useParams: true})

      wrapperUrl.should.eql(
        `http://0.0.0.0:8000/test/collectionOne?fields={"email":1}&filter={"email":{"$gt":1000}}`
      )

      done()
    })
  })
})
