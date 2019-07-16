'use strict'

module.exports = function(APIWrapper) {
  // Maintain a reference to the core terminators
  APIWrapper.prototype._find = APIWrapper.prototype.find

  /**
   * Apply the callback to the documents affected by the saved
   * query and update them
   *
   * @param {Function} callback
   * @return API
   * @api public
   */
  APIWrapper.prototype.apply = function(callback) {
    if (this.collection === undefined) {
      throw new Error('`apply()` must be used with a collection')
    }

    if (this.query === undefined) {
      throw new Error('Unable to find query for apply')
    }

    if (typeof callback !== 'function') {
      throw new Error('Invalid callback for apply')
    }

    return this._find().then(response => {
      const updateRequests = []

      response.results.forEach(document => {
        const newDocument = this._stripReservedProperties(callback(document))
        const auxAPIWrapper = new APIWrapper(this.options)
        const update = auxAPIWrapper
          .in(this.collection)
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
   * Get the documents affected by the saved query
   *
   * @return Promise
   * @api public
   */
  APIWrapper.prototype.find = function(options) {
    return this._find(options).then(response => {
      if (options && options.extractResults) {
        return response.results
      }

      return response
    })
  }
}
