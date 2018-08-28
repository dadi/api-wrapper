'use strict'

const APIWrapperCore = require('./core')
const APIWrapper = function (options) {
  if (typeof options === 'function') {
    this.options = {
      apiInstance: options
    }
  } else {
    this.options = options

    this.options.appId = this.options.appId || 'DADI API wrapper'
    this.options.port = this.options.port || 80
    this.options.tokenUrl = this.options.tokenUrl || '/token'

    let walletPath = __dirname + '/.wallet/token.' +
      this._slugify(options.uri + options.port) + '.' +
      (options.credentials ? this._slugify(options.credentials.clientId) : '-' ) +
      '.json'

    this.passportOptions = {
      accessToken: options.accessToken,
      issuer: {
        uri: options.uri,
        port: options.port,
        endpoint: options.tokenUrl
      },
      credentials: options.credentials,
      wallet: 'file',
      walletOptions: {
        path: walletPath
      }
    }
  }

  this.options.callback = this._processRequest.bind(this)
}

APIWrapper.prototype = new APIWrapperCore()

// -----------------------------------------
// Attach helpers
// -----------------------------------------

require('./lib/helpers')(APIWrapper)

// -----------------------------------------
// Attach filters
// -----------------------------------------

require('./lib/filters')(APIWrapper)

// -----------------------------------------
// Attach terminators
// -----------------------------------------

require('./lib/terminators')(APIWrapper)

module.exports = APIWrapper
