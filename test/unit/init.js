const path = require('path')
const should = require('should')
const sinon = require('sinon')

const apiWrapper = require(__dirname + '/../../index')

let wrapper
const options = {
  uri: '0.0.0.0',
  port: 8000,
  tokenUrl: '/token',
  credentials: {
    clientId: 'test',
    secret: 'secret'
  }
}

describe('Initialisation', function(done) {
  before(function(done) {
    done()
  })

  it('should be requirable', function(done) {
    apiWrapper.should.be.Function
    done()
  })

  it('should accept options and return an instance', function(done) {
    const wrapper = new apiWrapper(options)

    wrapper.options.should.eql(options)
    wrapper.passportOptions.issuer.uri.should.eql(options.uri)
    wrapper.passportOptions.issuer.port.should.eql(options.port)
    wrapper.passportOptions.issuer.endpoint.should.eql(options.tokenUrl)
    wrapper.passportOptions.credentials.should.eql(options.credentials)
    path
      .basename(wrapper.passportOptions.walletOptions.path)
      .should.eql('token.00008000.test.json')
    done()
  })

  it("should use defaults if options aren't provided", function(done) {
    delete options.port
    delete options.tokenUrl

    const wrapper = new apiWrapper(options)

    wrapper.options.should.eql(options)
    wrapper.passportOptions.issuer.port.should.eql(80)
    wrapper.passportOptions.issuer.endpoint.should.eql('/token')
    done()
  })

  describe('Helpers', function() {
    before(function() {
      wrapper = new apiWrapper(options)
    })

    it('should attach `_processRequest` to the wrapper', function(done) {
      wrapper._processRequest.should.be.Function
      done()
    })

    it('should attach `_slugify` to the wrapper', function(done) {
      wrapper._slugify.should.be.Function
      done()
    })
  })

  describe('Terminators', function() {
    before(function() {
      wrapper = new apiWrapper(options)
    })

    it('should attach `apply` to the wrapper', function(done) {
      wrapper.apply.should.be.Function
      done()
    })
  })
})
