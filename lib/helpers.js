'use strict'

const debug = require('debug')('api-wrapper')
const passport = require('@dadi/passport')
const request = require('request-promise')

module.exports = function (APIWrapper) {
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
      uri: requestObject.uri.href
    }

    if (
      requestObject.headers &&
      requestObject.headers['content-type'] &&
      requestObject.headers['content-type'] !== 'application/json'
    ) {
      options.json = false
    }

    return passport(this.passportOptions, request).then(authenticatedRequest => {
      debug(`Querying URI: ${decodeURIComponent(options.uri)}`)

      return authenticatedRequest(options).catch(err => {
        // Check for an expired token and request a new one
        if (
          err.response &&
          err.response.headers &&
          typeof err.response.headers['www-authenticate'] === 'string' &&
          err.response.headers['www-authenticate'].indexOf('invalid_token') !== -1
        ) {
          debug('The request failed due to an invalid bearer token. Requesting a new one...')

          return passport.refreshToken().then(token => {
            return this._processRequest(requestObject)
          })
        }

        return Promise.reject(err)
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
