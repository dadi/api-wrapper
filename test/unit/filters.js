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

describe('Filters', function(done) {
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

  describe('Feature querying', function() {
    it('should throw an error if a feature has been flagged as required but the response does not have a feature support header', function() {
      const host = options.uri + ':' + options.port
      const urlPath = '/test/collectionOne'
      const mockServer = nock(host, {
        reqheaders: {
          'x-dadi-requires': 'feature1;feature2'
        }
      })
        .get(urlPath)
        .reply(200, fakeResponse)

      return wrapper
        .inProperty('test')
        .in('collectionOne')
        .requireFeature('feature1')
        .requireFeature('feature2')
        .find()
        .catch(err => {
          mockServer.isDone().should.eql(true)

          err.message.should.eql(
            'API does not support features: feature1;feature2'
          )
          err.code.should.eql('MISSING_FEATURES')
          err.data.should.eql(['feature1', 'feature2'])
        })
    })

    it('should throw an error if a feature has been flagged as required but the feature support header does not include it', function() {
      const host = options.uri + ':' + options.port
      const urlPath = '/test/collectionOne'
      const mockServer = nock(host, {
        reqheaders: {
          'x-dadi-requires': 'feature1;feature2'
        }
      })
        .get(urlPath)
        .reply(200, fakeResponse, {
          'x-dadi-supports': 'feature1'
        })

      return wrapper
        .inProperty('test')
        .in('collectionOne')
        .requireFeature('feature1')
        .requireFeature('feature2')
        .find()
        .catch(err => {
          mockServer.isDone().should.eql(true)

          err.message.should.eql('API does not support features: feature2')
          err.code.should.eql('MISSING_FEATURES')
          err.data.should.eql(['feature2'])
        })
    })

    it('should return the response if a feature has been flagged as required and the feature support header includes it', function() {
      const host = options.uri + ':' + options.port
      const urlPath = '/test/collectionOne'
      const mockServer = nock(host, {
        reqheaders: {
          'x-dadi-requires': 'feature1;feature2'
        }
      })
        .get(urlPath)
        .reply(200, fakeResponse, {
          'x-dadi-supports': 'feature1;feature2'
        })

      return wrapper
        .inProperty('test')
        .in('collectionOne')
        .requireFeature('feature1')
        .requireFeature('feature2')
        .find()
        .then(data => {
          mockServer.isDone().should.eql(true)

          data.should.eql(fakeResponse)
        })
    })
  })
})
