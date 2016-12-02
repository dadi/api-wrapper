'use strict'

const passport = require('@dadi/passport')
const request = require('request-promise')
const querystring = require('query-string')
const url = require('url')

module.exports = function (APIWrapper) {
  /**
   * Logs a message. Overrides the basic log mechanism with DADI Logger
   *
   * @param {String} message
   * @return undefined
   * @api private
   */
  APIWrapper.prototype._log = function (message) {
    this.logger.info(message)
  }

  /**
   * Makes a request to API and handles possible failures
   *
   * @param {Object} options - request options
   * @return Results
   * @api private
   */
  APIWrapper.prototype._processRequest = function (requestObject) {
    let options = {
      body: requestObject.body,
      headers: Object.assign({}, {
        'app-id': this.options.appId
      }, requestObject.headers),
      json: true,
      method: requestObject.method,
      uri: requestObject.uri.href,
    }

    return passport(this.passportOptions, request).then(authenticatedRequest => {
      this._log(`Querying URI: ${decodeURIComponent(options.uri)}`)

      return authenticatedRequest(options).catch(err => {
        // Check for an expired token and request a new one
        if (err.response && err.response.headers['www-authenticate'].indexOf('invalid_token') !== -1) {
          this._log(`The request failed due to an invalid bearer token. Requesting a new one...`)

          return passport.refreshToken().then(token => {
            return this._request(options)
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
      .replace(/[\?#][\s\S]*$/g, '')
      .replace(/\/+/g, '-')
      .replace(/\s+/g, '')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
  }
}
