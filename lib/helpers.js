'use strict'

const debug = require('debug')('api-wrapper')
const passport = require('@dadi/passport')
const request = require('request-promise')

module.exports = function (APIWrapper) {
  /**
   * Logs a debug message to the console when running with `DEBUG=*`.
   *
   * @param {String} message
   * @return undefined
   * @api private
   */
  APIWrapper.prototype._log = function (message) {
    debug(message)
  }

  /**
   * Makes a request to API and handles possible failures
   *
   * @param {Object} options - request options
   * @return Results
   * @api private
   */
  APIWrapper.prototype._processRequest = function (requestObject) {
    // keep a handle to the passed in options in case
    // we need to refresh the token, so we can call _processRequest again
    // with the same params
    this.originalRequestObject = requestObject

    let options = {
      body: requestObject.body,
      headers: Object.assign({}, {
        'app-id': this.options.appId
      }, requestObject.headers),
      json: true,
      method: requestObject.method,
      uri: requestObject.uri.href
    }

    return passport(this.passportOptions, request).then(authenticatedRequest => {
      this._log(`Querying URI: ${decodeURIComponent(options.uri)}`)

      return authenticatedRequest(options).catch(err => {
        // Check for an expired token and request a new one
        if (err.response && err.response.headers['www-authenticate'].indexOf('invalid_token') !== -1) {
          this._log(`The request failed due to an invalid bearer token. Requesting a new one...`)

          return passport.refreshToken().then(token => {
            return this._processRequest(this.originalRequestObject)
          })
        }
      })
    })
  }

  /**
   * Creates a URL/filename friendly version (slug) of any object that implements `toString()`
   *
   * @param {Object} input - object to be slugified
   * @return String
   * @api private
   */
  APIWrapper.prototype._slugify = function (input) {
    return input.toString()
      .toLowerCase()
      .replace(/[?#][\s\S]*$/g, '')
      .replace(/\/+/g, '-')
      .replace(/\s+/g, '')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
  }
}
