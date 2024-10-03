'use strict'

module.exports = function(APIWrapper) {
  /**
   * Select a custom endpoint
   *
   * @param {String} endpoint
   * @return API
   * @api public
   */
  APIWrapper.prototype.fromEndpoint = function(endpoint) {
    this.endpoint = endpoint

    return this
  }

  /**
   * Select a page
   *
   * @param {Number} page
   * @return API
   * @api public
   */
  APIWrapper.prototype.goToPage = function(page) {
    this.page = page

    return this
  }

  /**
   * Select a collection
   *
   * @param {String} collection
   * @return API
   * @api public
   */
  APIWrapper.prototype.in = function(collection) {
    this.collection = collection

    return this
  }

  /**
   * Sets "clients mode" (i.e. executes commands on clients)
   *
   * @return API
   * @api public
   */
  APIWrapper.prototype.inClients = function() {
    this.isClient = {
      enabled: true
    }

    return this
  }

  /**
   * Sets "hooks mode" (i.e. executes commands on hooks)
   *
   * @return API
   * @api public
   */
  APIWrapper.prototype.inHooks = function() {
    this.isHook = true

    return this
  }

  /**
   * Select a bucket
   *
   * @param {String} bucket
   * @return API
   * @api public
   */
  APIWrapper.prototype.inMedia = function(bucket) {
    bucket = bucket || true

    this.mediaBucket = bucket

    return this
  }

  /**
   * Select the property to be used
   *
   * @param {String} property
   * @return API
   * @api public
   */
  APIWrapper.prototype.inProperty = function(property) {
    this.property = property

    return this
  }

  /**
   * Select a document limit
   *
   * @param {Number} limit
   * @return API
   * @api public
   */
  APIWrapper.prototype.limitTo = function(limit) {
    this.limit = limit

    return this
  }

  /**
   * Set the search query
   *
   * @param {String} query
   * @return API
   * @api public
   */
  APIWrapper.prototype.setSearchQuery = function(query) {
    this.searchQuery = query

    return this
  }

  /**
   * Select a field to sort on and the sort direction
   *
   * @param {String} sortField
   * @param {String} sortOrder
   * @return API
   * @api public
   */
  APIWrapper.prototype.sortBy = function(sortField, sortOrder) {
    this.sort = this.sort || {}
    this.sort[sortField] = sortOrder === 'desc' ? -1 : 1

    return this
  }

  /**
   * (DEPRECATED) Select the database to be used
   *
   * @param {String} database
   * @return API
   * @api public
   */
  APIWrapper.prototype.useDatabase = function(database) {
    this.property = database

    return this
  }

  /**
   * Select the fields to retrieve
   *
   * @param {Array} fields
   * @return API
   * @api public
   */
  APIWrapper.prototype.useFields = function(fields) {
    if (fields !== undefined) {
      const fieldsObj = {}

      fields.forEach(function(field) {
        fieldsObj[field] = 1
      })

      this.fields = JSON.stringify(fieldsObj)
    }

    return this
  }

  /**
   * Set the language to be used when querying
   *
   * @param {String} language - ISO 639 language code
   * @return API
   * @api public
   */
  APIWrapper.prototype.useLanguage = function(language) {
    this.language = language

    return this
  }

  /**
   * Select the version to be used
   *
   * @param {String} version
   * @return API
   * @api public
   */
  APIWrapper.prototype.useVersion = function(version) {
    this.customVersion = version

    return this
  }

  /**
   * Set the saved query to a Mongo query expression
   *
   * @param {Object} query
   * @return API
   * @api public
   */
  APIWrapper.prototype.where = function(query) {
    this.query = query

    return this
  }

  /**
   * Adds a filter to the query that selects a client by ID
   *
   * @param {String} value
   * @return API
   * @api public
   */
  APIWrapper.prototype.whereClientIs = function(value) {
    if (!this.isClient || !this.isClient.enabled) {
      throw new Error('Not in clients mode. Have you used `.inClients()`?')
    }

    this.isClient.id = value

    return this
  }

  /**
   * Adds a filter to the query that selects the client who generated the
   * bearer token.
   *
   * @return API
   * @api public
   */
  APIWrapper.prototype.whereClientIsSelf = function() {
    if (!this.isClient || !this.isClient.enabled) {
      throw new Error('Not in clients mode. Have you used `.inClients()`?')
    }

    this.isClient.self = true

    return this
  }

  /**
   * Add a /^value/i regex expression to the saved query
   *
   * @param {String} field
   * @param {String} value
   * @return API
   * @api public
   */
  APIWrapper.prototype.whereFieldBeginsWith = function(field, value) {
    this._addToQuery(field, '$regex', '^' + value)

    return this
  }

  /**
   * Add a /value/i regex expression to the saved query
   *
   * @param {String} field
   * @param {String} value
   * @return API
   * @api public
   */
  APIWrapper.prototype.whereFieldContains = function(field, value) {
    this._addToQuery(field, '$regex', value)

    return this
  }

  /**
   * Add a negated /value/i regex expression to the saved query
   *
   * @param {String} field
   * @param {String} value
   * @return API
   * @api public
   */
  APIWrapper.prototype.whereFieldDoesNotContain = function(field, value) {
    this._addToQuery(field, '$not', '/' + value + '/i')

    return this
  }

  /**
   * Add a {$exists: false} expression to the saved query
   *
   * @param {String} field
   * @return API
   * @api public
   */
  APIWrapper.prototype.whereFieldDoesNotExist = function(field) {
    this._addToQuery(field, '$eq', null)

    return this
  }

  /**
   * Add a /value$/i regex expression to the saved query
   *
   * @param {String} field
   * @param {String} value
   * @return API
   * @api public
   */
  APIWrapper.prototype.whereFieldEndsWith = function(field, value) {
    this._addToQuery(field, '$regex', value + '$')

    return this
  }

  /**
   * Add a {$exists: true} expression to the saved query
   *
   * @param {String} field
   * @return API
   * @api public
   */
  APIWrapper.prototype.whereFieldExists = function(field) {
    this._addToQuery(field, '$ne', null)

    return this
  }

  /**
   * Add an exact match expression to the saved query
   *
   * @param {String} field
   * @param {String} value
   * @return API
   * @api public
   */
  APIWrapper.prototype.whereFieldIsEqualTo = function(field, value) {
    this._addToQuery(field, value)

    return this
  }

  /**
   * Add a $gt expression to the saved query
   *
   * @param {String} field
   * @param {Number} value
   * @return API
   * @api public
   */
  APIWrapper.prototype.whereFieldIsGreaterThan = function(field, value) {
    this._addToQuery(field, '$gt', value)

    return this
  }

  /**
   * Add a $gte expression to the saved query
   *
   * @param {String} field
   * @param {Number} value
   * @return API
   * @api public
   */
  APIWrapper.prototype.whereFieldIsGreaterThanOrEqualTo = function(
    field,
    value
  ) {
    this._addToQuery(field, '$gte', value)

    return this
  }

  /**
   * Add a $lt expression to the saved query
   *
   * @param {String} field
   * @param {Number} value
   * @return API
   * @api public
   */
  APIWrapper.prototype.whereFieldIsLessThan = function(field, value) {
    this._addToQuery(field, '$lt', value)

    return this
  }

  /**
   * Add a $lte expression to the saved query
   *
   * @param {String} field
   * @param {Number} value
   * @return API
   * @api public
   */
  APIWrapper.prototype.whereFieldIsLessThanOrEqualTo = function(field, value) {
    this._addToQuery(field, '$lte', value)

    return this
  }

  /**
   * Add a negated exact match expression to the saved query
   *
   * @param {String} field
   * @param {String} value
   * @return API
   * @api public
   */
  APIWrapper.prototype.whereFieldIsNotEqualTo = function(field, value) {
    if (isNaN(value)) {
      this._addToQuery(field, '$not', '/^' + value + '$/i')
    } else {
      this._addToQuery(field, '$ne', value)
    }

    return this
  }

  /**
   * Add a $nin expression to the saved query
   *
   * @param {String} field
   * @param {Array} matches
   * @return API
   * @api public
   */
  APIWrapper.prototype.whereFieldIsNotOneOf = function(field, matches) {
    this._addToQuery(field, '$nin', matches)

    return this
  }

  /**
   * Add a $in expression to the saved query
   *
   * @param {String} field
   * @param {Array} matches
   * @return API
   * @api public
   */
  APIWrapper.prototype.whereFieldIsOneOf = function(field, matches) {
    this._addToQuery(field, '$in', matches)

    return this
  }

  /**
   * Filters hooks by name
   *
   * @param {String} name
   * @return API
   * @api public
   */
  APIWrapper.prototype.whereHookNameIs = function(name) {
    if (!this.isHook) {
      throw new Error('Not in hooks mode. Have you used `.inHooks()`?')
    }

    this.hookName = name

    return this
  }

  /**
   * Set composition for nested documents.
   * The value can be true, false, a number, "all", or undefined (to unset the previous value).
   * If a string value is passed, this function attempts to parse it to a Boolean or number.
   *
   * See https://github.com/dadi/docs/blob/master/docs/api/5.0.md#enabling-composition
   *
   * @param {Boolean|number|string} value
   * @return API
   * @api public
   */
  APIWrapper.prototype.withComposition = function(value) {
    if (typeof value === 'string') {
      if (value === 'true' || value === 'false') {
        value = Boolean(value)
      }

      if (/\d+/.test(value)) {
        const newValue = parseInt(value)

        if (!isNaN(value)) value = newValue
      }
    }

    if (
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === 'all' ||
      value === undefined
    ) {
      this.compose = value
    } else {
      this.compose = false
    }

    return this
  }

  /**
   * Toggles the composition of all history revisions for the current document
   *
   * @param {Boolean} value
   * @return API
   * @api public
   */
  APIWrapper.prototype.includeHistory = function(value) {
    this.history = value !== false

    return this
  }
}
