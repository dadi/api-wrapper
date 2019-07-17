'use strict'

module.exports = function(APIWrapper) {
  /**
   * Create one/multiple documents or hooks
   *
   * @param {Object} data
   * @return Promise
   * @api public
   */
  APIWrapper.prototype.create = function(data) {
    this.terminator = 'create'

    const requestPayload = {
      method: 'POST',
      uri: this._buildURL()
    }

    if (this._isValidHook()) {
      requestPayload.body = data

      this._setHeader('content-type', 'text/plain')
    } else {
      requestPayload.body =
        data instanceof Array
          ? data.map(this._stripReservedProperties.bind(this))
          : this._stripReservedProperties(data)
    }

    return this._createRequestObject(requestPayload)
  }

  /**
   * Delete the documents affected by the saved query
   *
   * @return Promise
   * @api public
   */
  APIWrapper.prototype.delete = function() {
    this.terminator = 'delete'

    const requestPayload = {
      method: 'DELETE',
      uri: this._buildURL()
    }

    if (!this._isValidHook()) {
      if (this.isClient) {
        if (!this.isClient.id && !this.isClient.self) {
          throw new Error(
            'Unable run delete on all clients. Please use the whereClientIs() filter.'
          )
        }
      } else {
        if (this.query === undefined) {
          throw new Error('Unable to find query for delete')
        }

        requestPayload.body = {
          query: this.query
        }
      }
    }

    return this._createRequestObject(requestPayload)
  }

  /**
   * Get the documents affected by the saved query
   *
   * @return Promise
   * @api public
   */
  APIWrapper.prototype.find = function(options) {
    this.terminator = 'find'

    if (options && options.extractMetadata) {
      this.count = true
    }

    return this._createRequestObject({
      method: 'GET',
      uri: this._buildURL({
        useParams: true
      })
    })
  }

  /**
   * Get a list of all collections
   *
   * @return Promise
   * @api public
   */
  APIWrapper.prototype.getCollections = function() {
    this.terminator = 'getCollections'

    return this._createRequestObject({
      method: 'GET',
      uri: this._buildURL({collections: true})
    })
  }

  /**
   * Get the config for a collection if one is specified, or for main API if not
   *
   * @return Promise
   * @api public
   */
  APIWrapper.prototype.getConfig = function() {
    this.terminator = 'getConfig'

    return this._createRequestObject({
      method: 'GET',
      uri: this._buildURL({config: true})
    })
  }

  /**
   * Get the languages supported by the API
   *
   * @return Promise
   * @api public
   */
  APIWrapper.prototype.getLanguages = function() {
    this.terminator = 'getLanguages'

    return this._createRequestObject({
      method: 'GET',
      uri: this._buildURL({languages: true})
    })
  }

  /**
   * Get a signed URL for media upload
   *
   * @return Promise
   * @api public
   */
  APIWrapper.prototype.getSignedUrl = function(parameters) {
    this.terminator = 'getSignedUrl'

    return this._createRequestObject({
      body: parameters,
      method: 'POST',
      uri: this._buildURL({signUrl: true})
    })
  }

  /**
   * Get collection stats
   *
   * @return Promise
   * @api public
   */
  APIWrapper.prototype.getStats = function() {
    this.terminator = 'getStats'

    return this._createRequestObject({
      method: 'GET',
      uri: this._buildURL({stats: true})
    })
  }

  /**
   * Get the status of the API
   *
   * @return Promise
   * @api public
   */
  APIWrapper.prototype.getStatus = function() {
    this.terminator = 'getStatus'

    return this._createRequestObject({
      method: 'POST',
      uri: this._buildURL({status: true})
    })
  }

  /**
   * Update the documents affect by the saved query
   *
   * @param {Object} update
   * @return Promise
   * @api public
   */
  APIWrapper.prototype.update = function(update) {
    this.terminator = 'update'

    const requestPayload = {
      method: 'PUT',
      uri: this._buildURL()
    }

    if (this._isValidHook()) {
      requestPayload.body = update

      this._setHeader('content-type', 'text/plain')
    } else {
      if (this.isClient) {
        if (!this.isClient.id && !this.isClient.self) {
          throw new Error(
            'Unable to run update on all clients. Please use whereClientIs() or whereClientIsSelf() filters.'
          )
        }

        // Remove `clientId` from the payload.
        if (update.clientId) {
          delete update.clientId
        }

        requestPayload.body = update
      } else {
        if (this.query === undefined) {
          throw new Error('Unable to find query for update')
        }

        requestPayload.body = {
          query: this.query,
          update: this._stripReservedProperties(update)
        }
      }
    }

    return this._createRequestObject(requestPayload)
  }
}
