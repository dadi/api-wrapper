'use strict'

const querystring = require('query-string')
const parseUrl = require('url-parse')

module.exports = function(APIWrapper) {
  /**
   * Add a Mongo query expression to the save query
   *
   * @param {String} field
   * @param {String} operator
   * @param {String} value
   * @return undefined
   * @api private
   */
  APIWrapper.prototype._addToQuery = function(field, operator, value) {
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
  APIWrapper.prototype._buildURL = function(options) {
    options = options || {}

    let url = ''

    url += this.options.uri
    url += ':' + this.options.port

    if (this.mediaBucket) {
      url +=
        '/media' +
        (typeof this.mediaBucket === 'string' ? '/' + this.mediaBucket : '')
    } else if (this.isClient) {
      if (this.isClient.self) {
        url += '/api/client'
      } else {
        url += '/api/clients'

        if (this.isClient.id) {
          url += '/' + this.isClient.id
        }
      }
    } else if (!this.collection && !this.endpoint) {
      url += '/api'
    } else if (this.collection) {
      url +=
        '/' +
        (this.property !== undefined
          ? this.property
          : this.options.property || this.options.database)
      url += '/' + this.collection
    } else {
      url +=
        '/' +
        (this.customVersion !== undefined
          ? this.customVersion
          : this.options.version) +
        '/' +
        this.endpoint
    }

    if (options.signUrl) {
      url += '/sign'
    }

    if (options.config) {
      url += '/config'
    }

    if (options.status) {
      url += '/status'
    }

    if (options.collections) {
      url += '/collections'
    }

    if (options.stats) {
      url += '/stats'
    }

    if (options.languages) {
      url += '/languages'
    }

    if (this.count) {
      url += '/count'
    }

    if (this.isHook) {
      url += '/hooks'

      if (this.hookName) {
        url += '/' + this.hookName + '/config'
      }

      return url
    }

    if (options.id) {
      url += '/' + options.id
    }

    if (options.useParams) {
      const params = {}

      if (this.query) {
        params.filter = JSON.stringify(this._encodeObjectKeys(this.query))
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

      if (this.compose !== undefined) {
        params.compose = this.compose
      }

      if (typeof this.history !== 'undefined') {
        params.includeHistory = this.history
      }

      if (this.sort) {
        params.sort = JSON.stringify(this.sort)
      }

      const paramsStr = querystring.stringify(params, {
        encode: false
      })

      if (paramsStr.length > 0) {
        url += '?' + paramsStr
      }
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
  APIWrapper.prototype._createRequestObject = function(options) {
    const parsedUri = parseUrl(options.uri)
    const requestObject = Object.assign({}, options, {
      uri: {
        href: parsedUri.href,
        hostname: parsedUri.hostname,
        path: parsedUri.path,
        port: parsedUri.port,
        protocol: parsedUri.protocol
      }
    })

    if (this.headers) {
      requestObject.headers = this.headers
    }

    if (typeof this.options.callback === 'function') {
      return this.options.callback(requestObject, this)
    }

    return requestObject
  }

  /**
   * Recursively URI encodes all properties of an object
   * @param  {Object} object The object to encode
   * @return {Object}        The encoded object
   */
  APIWrapper.prototype._encodeObjectKeys = function(object) {
    return Object.keys(object).reduce((result, key) => {
      if (
        object[key] &&
        typeof object[key] === 'object' &&
        !Array.isArray(object[key])
      ) {
        result[key] = this._encodeObjectKeys(object[key])
      } else {
        result[key] =
          typeof object[key] === 'string'
            ? encodeURIComponent(object[key])
            : object[key]
      }

      return result
    }, {})
  }

  /**
   * Checks whether the current chain is set to edit hooks instead of documents
   * and throws if any hook-related parameters are missing
   *
   * @return undefined
   * @api private
   */
  APIWrapper.prototype._isValidHook = function() {
    if (this.isHook) {
      if (!this.hookName) {
        throw new Error(
          "Couldn't find hook name. Are you using `.whereHookNameIs()?`"
        )
      }

      return true
    }

    return false
  }

  /**
   * Logs a message
   *
   * @param {String} message
   * @return undefined
   * @api private
   */
  APIWrapper.prototype._log = function(message) {
    if (console && console.log) {
      console.log(`[DADI API Wrapper] ${message}`)
    }
  }

  /**
   * Clear any saved options and parameters
   *
   * @return undefined
   * @api private
   */
  APIWrapper.prototype._reset = function() {
    this.params = {}
    this.customVersion = undefined
    this.property = undefined
  }

  /**
   * Set a header on the response object
   *
   * @param {String} name
   * @param {String} value
   * @return undefined
   * @api private
   */
  APIWrapper.prototype._setHeader = function(name, value) {
    this.headers = this.headers || {}

    this.headers[name] = value
  }

  /**
   * Strip reserved properties from document object
   *
   * @param {Object} document
   * @return Object
   * @api private
   */
  APIWrapper.prototype._stripReservedProperties = function(document) {
    const sanitisedDocument = {}

    Object.keys(document).forEach(property => {
      if (this.reservedProperties.indexOf(property) === -1) {
        sanitisedDocument[property] = document[property]
      }
    })

    return sanitisedDocument
  }
}
