module.exports = function (DadiAPI) {
  /**
   * Select a custom endpoint
   *
   * @param {String} endpoint
   * @return API
   * @api public
   */
  DadiAPI.prototype.fromEndpoint = function (endpoint) {
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
  DadiAPI.prototype.goToPage = function (page) {
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
  DadiAPI.prototype.in = function (collection) {
    this.collection = collection

    return this
  }

  /**
   * Select a document limit
   *
   * @param {Number} limit
   * @return API
   * @api public
   */
  DadiAPI.prototype.limitTo = function (limit) {
    this.limit = limit

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
  DadiAPI.prototype.sortBy = function (sortField, sortOrder) {
    this.sort = this.sort || {}
    this.sort[sortField] = (sortOrder === 'desc') ? -1 : 1

    return this
  }

  /**
   * Select the database to be used
   *
   * @param {String} database
   * @return API
   * @api public
   */
  DadiAPI.prototype.useDatabase = function (database) {
    this.customDatabase = database

    return this
  }

  /**
   * Select the fields to retrieve
   *
   * @param {Array} fields
   * @return API
   * @api public
   */
  DadiAPI.prototype.useFields = function (fields) {
    if (fields !== undefined) {
      var fieldsObj = {}

      fields.forEach(function (field) {
        fieldsObj[field] = 1
      })

      this.fields = JSON.stringify(fieldsObj)  
    }

    return this
  }

  /**
   * Select the version to be used
   *
   * @param {String} version
   * @return API
   * @api public
   */
  DadiAPI.prototype.useVersion = function (version) {
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
  DadiAPI.prototype.where = function (query) {
    this.query = query

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
  DadiAPI.prototype.whereFieldBeginsWith = function (field, value) {
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
  DadiAPI.prototype.whereFieldContains = function (field, value) {
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
  DadiAPI.prototype.whereFieldDoesNotContain = function (field, value) {
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
  DadiAPI.prototype.whereFieldDoesNotExist = function (field) {
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
  DadiAPI.prototype.whereFieldEndsWith = function (field, value) {
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
  DadiAPI.prototype.whereFieldExists = function (field) {
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
  DadiAPI.prototype.whereFieldIsEqualTo = function (field, value) {
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
  DadiAPI.prototype.whereFieldIsGreaterThan = function (field, value) {
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
  DadiAPI.prototype.whereFieldIsGreaterThanOrEqualTo = function (field, value) {
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
  DadiAPI.prototype.whereFieldIsLessThan = function (field, value) {
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
  DadiAPI.prototype.whereFieldIsLessThanOrEqualTo = function (field, value) {
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
  DadiAPI.prototype.whereFieldIsNotEqualTo = function (field, value) {
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
  DadiAPI.prototype.whereFieldIsNotOneOf = function (field, matches) {
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
  DadiAPI.prototype.whereFieldIsOneOf = function (field, matches) {
    this._addToQuery(field, '$in', matches)

    return this
  }

  /**
   * Toggles composition for nested documents
   *
   * @param {Boolean} value
   * @return API
   * @api public
   */
  DadiAPI.prototype.withComposition = function (value) {
    this.compose = value !== false

    return this
  }

  /**
   * Toggles the composition of all history revisions for the current document
   *
   * @param {Boolean} value
   * @return API
   * @api public
   */
  DadiAPI.prototype.includeHistory = function (value) {
    this.history = value !== false

    return this
  }
}
