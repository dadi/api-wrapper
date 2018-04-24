'use strict'

const APIWrapper = function (options) {
  this.options = options

  this.reservedProperties = [
    '_id',
    'apiVersion',
    'createdBy',
    'createdAt',
    'lastModifiedAt',
    'lastModifiedBy',
    'v',
    'history',
    'composed'
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
