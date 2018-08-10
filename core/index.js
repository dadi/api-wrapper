'use strict'

const APIWrapper = function (options) {
  this.options = options

  this.reservedProperties = [
    '_id',
    '_apiVersion',
    '_createdBy',
    '_createdAt',
    '_lastModifiedAt',
    '_lastModifiedBy',
    '_version',
    '_history',
    '_composed'
  ]  
}

// -----------------------------------------
// Attach helpers
// -----------------------------------------

require('./lib/helpers')(APIWrapper)

// -----------------------------------------
// Attach filters
// -----------------------------------------

require('./lib/filters')(APIWrapper)

// -----------------------------------------
// Attach terminators
// -----------------------------------------

require('./lib/terminators')(APIWrapper)

module.exports = APIWrapper
