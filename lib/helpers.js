'use strict'

const debug = require('debug')('api-wrapper')
const passport = require('@dadi/passport')
const request = require('request-promise')

module.exports = function (APIWrapper) {
  APIWrapper.prototype._getModelFunction = function (requestObject) {
    let model = this.options.apiInstance(this.collection)

    switch (this.terminator) {
      case 'create':
        return model.create({
          documents: requestObject.body
        })

      case 'delete':
        return model.delete({
          query: this.query
        })

      case 'find':
        let options = {}

        if (this.fields) {
          options.fields = JSON.parse(this.fields)
        }

        if (this.compose !== undefined) {
          options.compose = this.compose
        }

        return model.get({
          query: this.query,
          options
        })

      case 'update':
        return model.update({
          query: this.query,
          update: requestObject.body.update
        })
    }
  }

  /**
   * Makes a request to API and handles possible failures
   *
   * @param {Object} options - request options
   * @return Results
   * @api private
   */
  APIWrapper.prototype._processRequest = function (requestObject, core) {
    if (this.options.apiInstance) {
      return this._getModelFunction(requestObject)
    }

    let options = {
      body: requestObject.body,
      headers: Object.assign({}, {
        'app-id': this.options.appId
      }, requestObject.headers),
      json: true,
      method: requestObject.method,
      resolveWithFullResponse: true,
      uri: requestObject.uri.href
    }

    if (this.requiredFeatures) {
      options.headers['x-dadi-requires'] = this.requiredFeatures.join(';')
    }

    if (
      requestObject.headers &&
      requestObject.headers['content-type'] &&
      requestObject.headers['content-type'] !== 'application/json'
    ) {
      options.json = false
    }

    if (this.options.accessToken) {
      options.headers.Authorization = 'Bearer ' + this.options.accessToken

      return request(options).then(response => response.body)
    }

    return passport(this.passportOptions, request).then(authenticatedRequest => {
      debug(`Querying URI: ${decodeURIComponent(options.uri)}`)

      return authenticatedRequest(options).then(response => {
        if (this.requiredFeatures) {
          let supportedFeatures = response.headers['x-dadi-supports'] || []
          let missingFeatures = this.requiredFeatures.filter(feature => {
            return supportedFeatures.indexOf(feature) === -1
          })

          if (missingFeatures.length > 0) {
            let error = new Error(`API does not support features: ${missingFeatures.join(';')}`)

            error.code = 'MISSING_FEATURES'
            error.data = missingFeatures

            return Promise.reject(error)
          }
        }

        return response.body
      }).catch(err => {
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
