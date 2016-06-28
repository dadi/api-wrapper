var path = require('path')
var should = require('should')
var sinon = require('sinon')

var apiWrapper = require(__dirname + '/../../index')

var wrapper
var options = {
  uri: '0.0.0.0',
  port: 8000,
  tokenUrl: '/token',
  credentials: {
    clientId: 'test',
    secret: 'secret'
  }
}

describe('Initialisation', function (done) {
  before(function (done) {
    done()
  })

  it('should be requirable', function (done) {
    apiWrapper.should.be.Function
    done()
  })

  it('should accept options and return an instance', function (done) {
    var wrapper = new apiWrapper(options)
    wrapper.options.should.eql(options)
    wrapper.passportOptions.issuer.uri.should.eql(options.uri)
    wrapper.passportOptions.issuer.port.should.eql(options.port)
    wrapper.passportOptions.issuer.endpoint.should.eql(options.tokenUrl)
    wrapper.passportOptions.credentials.should.eql(options.credentials)
    path.basename(wrapper.passportOptions.walletOptions.path).should.eql('token.00008000.test.json')
    done()
  })

  describe('Helpers', function () {
    before(function() {
      wrapper = new apiWrapper(options)
    })

    it('should attach `_addToQuery` to the wrapper', function (done) {
      wrapper._addToQuery.should.be.Function
      done()
    })

    it('should attach `_buildURL` to the wrapper', function (done) {
      wrapper._buildURL.should.be.Function
      done()
    })

    it('should attach `_get` to the wrapper', function (done) {
      wrapper._get.should.be.Function
      done()
    })

    it('should attach `_reset` to the wrapper', function (done) {
      wrapper._reset.should.be.Function
      done()
    })

    it('should attach `_slugify` to the wrapper', function (done) {
      wrapper._slugify.should.be.Function
      done()
    })
  })

  describe('Filters', function () {
    before(function() {
      wrapper = new apiWrapper(options)
    })

    it('should attach `fromEndpoint` to the wrapper', function (done) {
      wrapper.fromEndpoint.should.be.Function
      done()
    })

    it('should attach `goToPage` to the wrapper', function (done) {
      wrapper.goToPage.should.be.Function
      done()
    })

    it('should attach `in` to the wrapper', function (done) {
      wrapper.in.should.be.Function
      done()
    })

    it('should attach `limitTo` to the wrapper', function (done) {
      wrapper.limitTo.should.be.Function
      done()
    })

    it('should attach `sortBy` to the wrapper', function (done) {
      wrapper.sortBy.should.be.Function
      done()
    })

    it('should attach `useDatabase` to the wrapper', function (done) {
      wrapper.useDatabase.should.be.Function
      done()
    })

    it('should attach `useFields` to the wrapper', function (done) {
      wrapper.useFields.should.be.Function
      done()
    })

    it('should attach `useVersion` to the wrapper', function (done) {
      wrapper.useVersion.should.be.Function
      done()
    })

    it('should attach `where` to the wrapper', function (done) {
      wrapper.where.should.be.Function
      done()
    })

    it('should attach `whereFieldBeginsWith` to the wrapper', function (done) {
      wrapper.whereFieldBeginsWith.should.be.Function
      done()
    })

    it('should attach `whereFieldContains` to the wrapper', function (done) {
      wrapper.whereFieldContains.should.be.Function
      done()
    })

    it('should attach `whereFieldDoesNotContain` to the wrapper', function (done) {
      wrapper.whereFieldDoesNotContain.should.be.Function
      done()
    })

    it('should attach `whereFieldExists` to the wrapper', function (done) {
      wrapper.whereFieldExists.should.be.Function
      done()
    })

    it('should attach `whereFieldDoesNotExist` to the wrapper', function (done) {
      wrapper.whereFieldDoesNotExist.should.be.Function
      done()
    })

    it('should attach `whereFieldEndsWith` to the wrapper', function (done) {
      wrapper.whereFieldEndsWith.should.be.Function
      done()
    })

    it('should attach `whereFieldIsEqualTo` to the wrapper', function (done) {
      wrapper.whereFieldIsEqualTo.should.be.Function
      done()
    })

    it('should attach `whereFieldIsNotEqualTo` to the wrapper', function (done) {
      wrapper.whereFieldIsNotEqualTo.should.be.Function
      done()
    })

    it('should attach `whereFieldIsOneOf` to the wrapper', function (done) {
      wrapper.whereFieldIsOneOf.should.be.Function
      done()
    })

    it('should attach `whereFieldIsNotOneOf` to the wrapper', function (done) {
      wrapper.whereFieldIsNotOneOf.should.be.Function
      done()
    })

    it('should attach `whereFieldIsLessThan` to the wrapper', function (done) {
      wrapper.whereFieldIsLessThan.should.be.Function
      done()
    })

    it('should attach `whereFieldIsGreaterThan` to the wrapper', function (done) {
      wrapper.whereFieldIsGreaterThan.should.be.Function
      done()
    })

    it('should attach `whereFieldIsLessThanOrEqualTo` to the wrapper', function (done) {
      wrapper.whereFieldIsLessThanOrEqualTo.should.be.Function
      done()
    })

    it('should attach `whereFieldIsGreaterThanOrEqualTo` to the wrapper', function (done) {
      wrapper.whereFieldIsGreaterThanOrEqualTo.should.be.Function
      done()
    })

    it('should attach `withComposition` to the wrapper', function (done) {
      wrapper.withComposition.should.be.Function
      done()
    })

    it('should attach `includeHistory` to the wrapper', function (done) {
      wrapper.includeHistory.should.be.Function
      done()
    })
  })

  describe('Terminators', function () {
    before(function() {
      wrapper = new apiWrapper(options)
    })

    it('should attach `apply` to the wrapper', function (done) {
      wrapper.apply.should.be.Function
      done()
    })

    it('should attach `find` to the wrapper', function (done) {
      wrapper.find.should.be.Function
      done()
    })

    it('should attach `create` to the wrapper', function (done) {
      wrapper.create.should.be.Function
      done()
    })

    it('should attach `update` to the wrapper', function (done) {
      wrapper.update.should.be.Function
      done()
    })

    it('should attach `delete` to the wrapper', function (done) {
      wrapper.delete.should.be.Function
      done()
    })

    it('should attach `getConfig` to the wrapper', function (done) {
      wrapper.getConfig.should.be.Function
      done()
    })

    it('should attach `setConfig` to the wrapper', function (done) {
      wrapper.setConfig.should.be.Function
      done()
    })

    it('should attach `getStats` to the wrapper', function (done) {
      wrapper.getStats.should.be.Function
      done()
    })
  })
})
