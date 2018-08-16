'use strict'

module.exports = function (APIWrapper) {
  /**
   * Adds a requirement for a particular feature code.
   *
   * @param {String} feature
   * @return API
   * @api public
   */
  APIWrapper.prototype.requireFeature = function (feature) {
    this.requiredFeatures = this.requiredFeatures || []
    this.requiredFeatures.push(feature)

    return this
  }
}
