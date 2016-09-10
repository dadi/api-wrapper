var passport = require('@dadi/passport')
var request = require('request-promise')
var querystring = require('query-string')

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

    var url = ''

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
      var params = {}

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

      if (this.compose) {
        params.compose = this.compose
      }

      if (this.includeHistory) {
        params.includeHistory = this.history
      }

      if (this.sort) {
        params.sort = JSON.stringify(this.sort)
      }

      var paramsStr = querystring.stringify(params, {strict: false})
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
   * Get response from API
   *
   * @return Promise
   * @api public
   */
  DadiAPI.prototype._get = function () {
    var uri = this._buildURL({
      useParams: true
    })

    if (this.options.debug && console) {
      console.log('[@dadi/api-wrapper] Querying URI:', decodeURIComponent(uri))
    }

    return passport(this.passportOptions, request).then((request) => {
      return request({
        headers: {
          'app-id': this.options.appId
        },
        json: true,
        method: 'GET',
        uri: uri
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
