'use strict'

const APIWrapperCore = require(__dirname + '/../api-wrapper-core')

const APIWrapper = function (options) {
  this.options = options

  this.options.appId = this.options.appId || 'DADI API wrapper'
  this.options.port = this.options.port || 80
  this.options.tokenUrl = this.options.tokenUrl || '/token'

  this.passportOptions = {
    issuer: {
      uri: options.uri,
      port: options.port,
      endpoint: options.tokenUrl
    },
    credentials: options.credentials,
    wallet: 'file',
    walletOptions: {
      path: __dirname + '/.wallet/token.' + this._slugify(options.uri + options.port) + '.' + this._slugify(options.credentials.clientId) + '.json'
    }
  }

  // Initialise logger
  this.logger = require('@dadi/logger')
  this.logger.init({
    enabled: true,
    filename: 'api-wrapper',
    level: this.options.debug ? 'info' : 'warn'
  })
}

APIWrapper.prototype = new APIWrapperCore()

// -----------------------------------------
// Attach helpers
// -----------------------------------------

require('./lib/helpers')(APIWrapper)

// -----------------------------------------
// Attach terminators
// -----------------------------------------

require('./lib/terminators')(APIWrapper)

module.exports = APIWrapper
