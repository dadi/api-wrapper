'use strict'

module.exports = function (APIWrapper) {
  // Maintain a reference to the core terminators
  APIWrapper.prototype._create = APIWrapper.prototype.create
  APIWrapper.prototype._delete = APIWrapper.prototype.delete
  APIWrapper.prototype._find = APIWrapper.prototype.find
  APIWrapper.prototype._getStatus = APIWrapper.prototype.getStatus
  APIWrapper.prototype._getConfig = APIWrapper.prototype.getConfig
  APIWrapper.prototype._getCollections = APIWrapper.prototype.getCollections
  APIWrapper.prototype._getStats = APIWrapper.prototype.getStats
  APIWrapper.prototype._setConfig = APIWrapper.prototype.setConfig
  APIWrapper.prototype._update = APIWrapper.prototype.update

  /**
   * Apply the callback to the documents affected by the saved
   * query and update them
   *
   * @param {Function} callback
   * @return API
   * @api public
   */
  APIWrapper.prototype.apply = function (callback) {
    if (this.collection === undefined) {
      throw new Error('`apply()` must be used with a collection')
    }

    if (this.query === undefined) {
      throw new Error('Unable to find query for apply')
    }

    if (typeof callback !== 'function') {
      throw new Error('Invalid callback for apply')
    }

    return this._processRequest(this._find(callback)).then(response => {
      let updateRequests = []

      response.results.forEach(document => {
        const newDocument = this._stripReservedProperties(callback(document))
        const auxAPIWrapper = new APIWrapper(this.options)
        const update = auxAPIWrapper.in(this.collection)
                                    .useVersion(this.customVersion)
                                    .useDatabase(this.customDatabase)
                                    .whereFieldIsEqualTo('_id', document._id)
                                    .update(newDocument)

        updateRequests.push(update)
      })

      return Promise.all(updateRequests).then(responses => {
        let updatedDocuments = []

        responses.forEach(response => {
          if (response.results) {
            updatedDocuments = updatedDocuments.concat(response.results)
          }
        })

        return updatedDocuments
      })
    })
  }

  /**
   * Create one or multiple documents
   *
   * @param {Object} documents
   * @return Promise
   * @api public
   */
  APIWrapper.prototype.create = function (documents) {
    return this._processRequest(this._create(documents))
  }

  /**
   * Delete the documents affected by the saved query
   *
   * @return Promise
   * @api public
   */
  APIWrapper.prototype.delete = function () {
    return this._processRequest(this._delete())
  }

  /**
   * Get the documents affected by the saved query
   *
   * @return Promise
   * @api public
   */
  APIWrapper.prototype.find = function (options) {
    return this._processRequest(this._find(options)).then(response => {
      if (options && options.extractResults) {
        return response.results
      }

      return response
    })
  }

  /**
   * Get the status of the main API
   *
   * @return Promise
   * @api public
   */
  APIWrapper.prototype.getStatus = function () {
    return this._processRequest(this._getStatus())
  }

  /**
   * Get a list of all collections
   *
   * @return Promise
   * @api public
   */
  APIWrapper.prototype.getCollections = function (options) {
    return this._processRequest(this._getCollections())
  }

  /**
   * Get the config for a collection if one is specified, or for main API if not
   *
   * @return Promise
   * @api public
   */
  APIWrapper.prototype.getConfig = function (options) {
    return this._processRequest(this._getConfig())
  }

  /**
   * Get collection stats
   *
   * @return Promise
   * @api public
   */
  APIWrapper.prototype.getStats = function () {
    return this._processRequest(this._getStats())
  }

  /**
   * Set the config for a collection if one is specified, or for main API if not
   *
   * @param {String} sortField
   * @param {String} sortOrder
   * @return API
   * @api public
   */
  APIWrapper.prototype.setConfig = function (newConfig) {
    return this._processRequest(this._setConfig(newConfig))
  }

  /**
   * Update the documents affect by the saved query
   *
   * @param {Object} update
   * @return Promise
   * @api public
   */
  APIWrapper.prototype.update = function (update) {
    return this._processRequest(this._update(update))
  }
}
