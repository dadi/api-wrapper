var passport = require('@dadi/passport')
var request = require('request-promise')

module.exports = function (DadiAPI) {
  /**
   * Apply the callback to the documents affected by the saved
   * query and update them
   *
   * @param {Function} callback
   * @return API
   * @api public
   */
  DadiAPI.prototype.apply = function (callback) {
    if (this.collection === undefined) {
      throw new Error('`apply()` must be used with a collection')
    }

    if (this.query === undefined) {
      throw new Error('Unable to find query for apply')
    }

    if (typeof callback !== 'function') {
      throw new Error('Invalid callback for apply')
    }

    var api = this

    return passport(this.passportOptions, request).then(function (request) {
      // Getting a list of the affected documents
      return request({
        json: true,
        method: 'GET',
        uri: api._buildURL({
          useParams: true
        })
      }).then(function (response) {
        var updateRequests = []
        var updatedDocuments = []

        response.results.forEach(function (document) {
          newDocument = callback(document)

          // Updating document
          updateRequests.push(request({
            body: newDocument,
            json: true,
            method: 'PUT',
            uri: api._buildURL({
              id: document._id
            })
          }))
        })

        return Promise.all(updateRequests).then(function (updatedDocuments) {
          return updatedDocuments
        })
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
  DadiAPI.prototype.create = function (documents) {
    return passport(this.passportOptions, request).then((function (request) {
      return request({
        body: documents,
        json: true,
        method: 'POST',
        uri: this._buildURL()
      })
    }).bind(this))
  }

  /**
   * Delete the documents affected by the saved query
   *
   * @return Promise
   * @api public
   */
  DadiAPI.prototype.delete = function () {
    var api = this

    if (this.query === undefined) {
      throw new Error('Unable to find query for delete')
    }

    return passport(this.passportOptions, request).then((function (request) {
      // Getting a list of the affected documents
      return request({
        json: true,
        method: 'GET',
        uri: api._buildURL({
          useParams: true
        })
      }).then(function (response) {
        var deleteRequests = []

        response.results.forEach(function (document) {
          // Deleting documents
          deleteRequests.push(request({
            json: true,
            method: 'DELETE',
            uri: api._buildURL({
              id: document._id
            })
          }))
        })

        return Promise.all(deleteRequests).then(function () {
          return true
        })
      })
    }))
  }

  /**
   * Get the documents affected by the saved query
   *
   * @return Promise
   * @api public
   */
  DadiAPI.prototype.find = function (options) {
    options = options || {}

    return this._get().then(function (response) {
      if (options.extractResults) {
        return response.results
      }

      if (options.extractMetadata) {
        return response.metadata
      }

      return response
    })
  }

  /**
   * Get the config for a collection if one is specified, or for main API if not
   *
   * @return Promise
   * @api public
   */
  DadiAPI.prototype.getConfig = function () {
    return passport(this.passportOptions, request).then((function (request) {
      return request({
        json: true,
        method: 'GET',
        uri: this._buildURL({config: true})
      })
    }).bind(this))
  }

  /**
   * Get collection stats
   *
   * @return Promise
   * @api public
   */
  DadiAPI.prototype.getStats = function () {
    return passport(this.passportOptions, request).then((function (request) {
      return request({
        json: true,
        method: 'GET',
        uri: this._buildURL({stats: true})
      })
    }).bind(this))
  }

  /**
   * Set the config for a collection if one is specified, or for main API if not
   *
   * @param {String} sortField
   * @param {String} sortOrder
   * @return API
   * @api public
   */
  DadiAPI.prototype.setConfig = function (newConfig) {
    return passport(this.passportOptions, request).then((function (request) {
      return request({
        body: newConfig,
        json: true,
        method: 'POST',
        uri: this._buildURL({config: true})
      })
    }).bind(this))
  }

  /**
   * Update the documents affect by the saved query
   *
   * @param {Object} update
   * @return Promise
   * @api public
   */
  DadiAPI.prototype.update = function (update) {
    if (this.query === undefined) {
      throw new Error('Unable to find query for update')
    }

    return passport(this.passportOptions, request).then((function (request) {
      return request({
        body: {
          query: this.query,
          update: update
        },
        json: true,
        method: 'PUT',
        uri: this._buildURL()
      })
    }).bind(this))
  }
}
