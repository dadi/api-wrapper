'use strict'

const passport = require('@dadi/passport')
const request = require('request-promise')
const querystring = require('query-string')
const url = require('url')

module.exports = function (DadiAPI) {
  /**
   * Add a Mongo query expression to the save query
   *
   * @param {String} field
   * @param {String} operator
   * @param {String} value
   * @return undefined
   * @api private
   */
  DadiAPI.prototype._addToQuery = function (field, operator, value) {
    if (this.query === undefined) {
      this.query = {}
    }

    if (this.query[field] === undefined) {
      this.query[field] = {}
    }

    if (value === undefined) {
      this.query[field] = operator
    } else {
      this.query[field][operator] = value
    }
  }

  /**
   * Build an API URL
   *
   * @param {Object} options
   * @return String
   * @api private
   */
  DadiAPI.prototype._buildURL = function (options) {
    options = options || {}

    let url = ''

    url += this.options.uri
    url += ':' + this.options.port

    if (!this.collection && !this.endpoint) {
      url += '/api'
    } else {
      url += '/' + ((this.customVersion !== undefined) ? this.customVersion : this.options.version)

      if (this.collection) {
        url += '/' + ((this.customDatabase !== undefined) ? this.customDatabase : this.options.database)
        url += '/' + this.collection
      } else {
        url += '/' + this.endpoint
      }
    }

    if (options.config) {
      url += '/config'
    }

    if (options.stats) {
      url += '/stats'
    }

    if (this.count) {
      url += '/count'
    }

    if (options.useParams) {
      let params = {}

      if (this.query) {
        params.filter = JSON.stringify(this.query)
      }

      if (this.fields) {
        params.fields = this.fields
      }

      if (!isNaN(parseInt(this.limit))) {
        params.count = this.limit
      }

      if (this.page) {
        params.page = this.page
      }

      if (this.hasOwnProperty('compose')) {
        params.compose = this.compose
      }

      if (this.includeHistory) {
        params.includeHistory = this.history
      }

      if (this.sort) {
        params.sort = JSON.stringify(this.sort)
      }

      const paramsStr = querystring.stringify(params, {strict: false})

      if (paramsStr) {
        url += '?' + paramsStr
      }
    }

    if (options.id) {
      url += '/' + options.id
    }

    return url
  }

  /**
   * Formats a request as an object
   *
   * @param {Object} options - request options
   * @return Object
   * @api private
   */
  DadiAPI.prototype._formatRequest = function (options) {
    const parsedUri = url.parse(options.uri)
    const requestObj = Object.assign({}, options, {
      uri: {
        href: decodeURIComponent(parsedUri.href),
        hostname: parsedUri.hostname,
        path: decodeURIComponent(parsedUri.path),
        port: parsedUri.port,
        protocol: parsedUri.protocol
      }
    })

    return Promise.resolve(requestObj)
  }

  /**
   * Makes a request to API and handles possible failures
   *
   * @param {Object} options - request options
   * @return undefined
   * @api private
   */
  DadiAPI.prototype._request = function (requestOptions, extraOptions) {
    extraOptions = extraOptions || {}

    if (extraOptions.processRequest === false) {
      return this._formatRequest(requestOptions)
    }

    return passport(this.passportOptions, request).then(authenticatedRequest => {
      // Inject app ID into the header
      requestOptions.headers = requestOptions.headers || {}
      requestOptions.headers['app-id'] = this.options.appId

      // Set JSON mode
      requestOptions.json = true

      this.logger.info(`Querying URI: ${decodeURIComponent(requestOptions.uri)}`)

      return authenticatedRequest(requestOptions).catch(err => {
        // Check for an expired token and request a new one
        if (err.response.headers['www-authenticate'].indexOf('invalid_token') !== -1) {
          this.logger.info(`The request failed due to an invalid bearer token. Requesting a new one...`)

          return passport.refreshToken().then(token => {
            return this._request(requestOptions)
          })
        }
      })
    })
  }

  /**
   * Clear any saved options and parameters
   *
   * @return undefined
   * @api private
   */
  DadiAPI.prototype._reset = function () {
    this.params = {}
    this.customVersion = undefined
    this.customDatabase = undefined
  }

  /**
   * Creates a URL/filename friendly version (slug) of any object that implements `toString()`
   *
   * @param {Object} input - object to be slugified
   * @return String
   * @api private
   */
  DadiAPI.prototype._slugify = function (input) {
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
