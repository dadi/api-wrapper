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

    return passport(this.passportOptions, request).then((request) => {
      // Getting a list of the affected documents
      return request({
        headers: {
          'app-id': this.options.appId
        },
        json: true,
        method: 'GET',
        uri: this._buildURL({
          useParams: true
        })
      }).then((response) => {
        var updateRequests = []

        response.results.forEach((document) => {
          var newDocument = callback(document)
          var newDocumentSanitised = {}

          // Removing reserved properties
          Object.keys(newDocument).forEach((property) => {
            if (this.reservedProperties.indexOf(property) === -1) {
              newDocumentSanitised[property] = newDocument[property]
            }
          })

          // Updating document
          updateRequests.push(request({
            body: newDocumentSanitised,
            headers: {
              'app-id': this.options.appId
            },
            json: true,
            method: 'PUT',
            uri: this._buildURL({
              id: document._id
            })
          }))
        })

        return Promise.all(updateRequests).then((responses) => {
          var updatedDocuments = []

          responses.forEach((response) => {
            if (response.results) {
              updatedDocuments = updatedDocuments.concat(response.results)
            }
          })

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
    return passport(this.passportOptions, request).then((request) => {
      return request({
        headers: {
          'app-id': this.options.appId
        },
        body: documents,
        json: true,
        method: 'POST',
        uri: this._buildURL()
      })
    })
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

    return passport(this.passportOptions, request).then(request => {
      return request({
        body: {
          query: this.query
        },
        headers: {
          'app-id': this.options.appId
        },
        json: true,
        method: 'DELETE',
        uri: api._buildURL()
      })
    })
  }

  /**
   * Get the documents affected by the saved query
   *
   * @return Promise
   * @api public
   */
  DadiAPI.prototype.find = function (options) {
    if (options && options.extractMetadata) {
      this.count = true
    }

    return this._get().then((response) => {
      if (options && options.extractResults) {
        return response.results
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
    return passport(this.passportOptions, request).then((request) => {
      return request({
        headers: {
          'app-id': this.options.appId
        },
        json: true,
        method: 'GET',
        uri: this._buildURL({config: true})
      })
    })
  }

  /**
   * Get collection stats
   *
   * @return Promise
   * @api public
   */
  DadiAPI.prototype.getStats = function () {
    return passport(this.passportOptions, request).then((request) => {
      return request({
        headers: {
          'app-id': this.options.appId
        },
        json: true,
        method: 'GET',
        uri: this._buildURL({stats: true})
      })
    })
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
    return passport(this.passportOptions, request).then((request) => {
      return request({
        body: newConfig,
        headers: {
          'app-id': this.options.appId
        },
        json: true,
        method: 'POST',
        uri: this._buildURL({config: true})
      })
    })
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

    return passport(this.passportOptions, request).then((request) => {
      return request({
        body: {
          query: this.query,
          update: update
        },
        headers: {
          'app-id': this.options.appId
        },
        json: true,
        method: 'PUT',
        uri: this._buildURL()
      })
    })
  }
}
