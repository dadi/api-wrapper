'use strict'

module.exports = function (DadiAPI) {
  /**
   * Apply the callback to the documents affected by the saved
   * query and update them
   *
   * @param {Function} callback
   * @return API
   * @api public
   */
  DadiAPI.prototype.apply = function (callback, options) {
    if (this.collection === undefined) {
      throw new Error('`apply()` must be used with a collection')
    }

    if (this.query === undefined) {
      throw new Error('Unable to find query for apply')
    }

    if (typeof callback !== 'function') {
      throw new Error('Invalid callback for apply')
    }

    return this._request({
      method: 'GET',
      uri: this._buildURL({
        useParams: true
      })
    }, {
      processRequest: !(options && (options.processRequest === false))
    }).then(response => {
      let updateRequests = []

      response.results.forEach(document => {
        const newDocument = callback(document)
        const newDocumentSanitised = {}

        // Removing reserved properties
        Object.keys(newDocument).forEach(property => {
          if (this.reservedProperties.indexOf(property) === -1) {
            newDocumentSanitised[property] = newDocument[property]
          }
        })

        // Updating document
        updateRequests.push(this._request({
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
  DadiAPI.prototype.create = function (documents, options) {
    return this._request({
      body: documents,
      method: 'POST',
      uri: this._buildURL()
    }, {
      processRequest: !(options && (options.processRequest === false))
    })
  }

  /**
   * Delete the documents affected by the saved query
   *
   * @return Promise
   * @api public
   */
  DadiAPI.prototype.delete = function (options) {
    if (this.query === undefined) {
      throw new Error('Unable to find query for delete')
    }

    return this._request({
      body: {
        query: this.query
      },
      method: 'DELETE',
      uri: this._buildURL()
    }, {
      processRequest: !(options && (options.processRequest === false))
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

    return this._request({
      method: 'GET',
      uri: this._buildURL({
        useParams: true
      })
    }, {
      processRequest: !(options && (options.processRequest === false))
    }).then(response => {
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
  DadiAPI.prototype.getConfig = function (options) {
    return this._request({
      method: 'GET',
      uri: this._buildURL({config: true})
    }, {
      processRequest: !(options && (options.processRequest === false))
    })
  }

  /**
   * Get collection stats
   *
   * @return Promise
   * @api public
   */
  DadiAPI.prototype.getStats = function (options) {
    return this._request({
      method: 'GET',
      uri: this._buildURL({stats: true})
    }, {
      processRequest: !(options && (options.processRequest === false))
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
  DadiAPI.prototype.setConfig = function (newConfig, options) {
    return this._request({
      body: newConfig,
      method: 'POST',
      uri: this._buildURL({config: true})
    }, {
      processRequest: !(options && (options.processRequest === false))
    })
  }

  /**
   * Update the documents affect by the saved query
   *
   * @param {Object} update
   * @return Promise
   * @api public
   */
  DadiAPI.prototype.update = function (update, options) {
    if (this.query === undefined) {
      throw new Error('Unable to find query for update')
    }

    return this._request({
      body: {
        query: this.query,
        update: update
      },
      method: 'PUT',
      uri: this._buildURL()
    }, {
      processRequest: !(options && (options.processRequest === false))
    })
  }
}
