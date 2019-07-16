# DADI API wrapper

> A high-level library for interacting with DADI API

[![npm (scoped)](https://img.shields.io/npm/v/@dadi/api-wrapper.svg?maxAge=10800&style=flat-square)](https://www.npmjs.com/package/@dadi/api-wrapper)
[![Coverage Status](https://coveralls.io/repos/github/dadi/api-wrapper/badge.svg?branch=master)](https://coveralls.io/github/dadi/api-wrapper?branch=master)
[![Build Status](https://travis-ci.org/dadi/api-wrapper.svg?branch=master)](https://travis-ci.org/dadi/api-wrapper)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)

## Overview

[DADI API](https://github.com/dadi/api) is a high performance RESTful API layer designed in support of API-first development and the principle of COPE.

This library provides a high-level abstraction of the REST architecture style, exposing a set of chainable methods that allow developers to compose complex read and write operations using a simplistic and natural syntax.

## Getting started

1. Install the `@dadi/api-wrapper` module:

   ```shell
   npm install @dadi/api-wrapper --save
   ```

2. Add the library and configure the API settings:

   ```js
   const DadiAPI = require('@dadi/api-wrapper')
   const api = new DadiAPI({
     uri: 'http://api.example.com',
     port: 80,
     credentials: {
       clientId: 'johndoe',
       secret: 'f00b4r'
     },
     version: 'vjoin',
     database: 'testdb'
   })
   ```

3. Make a query:

   ```js
   // Example: getting all documents where `name` contains "john" and age is greater than 18
   api
     .in('users')
     .whereFieldContains('name', 'john')
     .whereFieldIsGreaterThan('age', 18)
     .find()
     .then(response => {
       // Use documents here
     })
   ```

## Methods

Each query consists of a series of chained methods to form the request, always containing a terminator method. Terminators return a Promise with the result of one or more requests to the database and can make use of a series of [filtering methods](#filters) to create the desired subset of documents to operate on.

### Terminators

#### `.apply(callback)`

Updates a list of documents with the result of individually applying `callback` to them.

```js
api
  .in('users')
  .whereFieldExists('gender')
  .apply(document => {
    document.name =
      document.gender === 'male'
        ? `Mr ${document.name}`
        : `Mrs ${document.name}`

    return document
  })
```

#### `.create()`

Creates a document.

```js
// Example
api
  .in('users')
  .create({
    name: 'John Doe',
    age: 45,
    address: '123 Fake St'
  })
  .then(function(doc) {
    console.log('New document:', doc)
  })
  .catch(function(err) {
    console.log('! Error:', err)
  })
```

#### `.delete()`

Deletes one or more documents.

```js
api
  .in('users')
  .whereFieldDoesNotExist('name')
  .delete()
```

#### `.find(options)`

Returns a list of documents.

```js
api
  .in('users')
  .whereFieldIsGreaterThan('age', 21)
  .useFields(['name', 'age'])
  .find(options)
```

`options` is one of the following:

- `extractResults` (Boolean): Selects whether just the results array should be returned, rather than the entire API response.
- `extractMetadata` (Boolean): Selects whether just the metadata object should be returned, rather than the entire API response.

#### `.getCollections()`

Gets the list of collections for the API.

```js
api.getCollections()
```

#### `.getConfig()`

Gets the config for a collection or for the API.

```js
// Gets the collection config
api.in('users').getConfig()
```

```js
// Gets the API config
api.getConfig()
```

#### `.getLanguages()`

Gets the list of languages supported by the API.

```js
api.getLanguages().then(({metadata, results}) => {
  /*
    {
      "defaultLanguage": {
        "code": "en",
        "name": "English",
        "local": "English"
      },
      "totalCount": 2
    }  
  */
  console.log(metadata)

  /*
    [
      {
        "code": "en",
        "name": "English",
        "local": "English",
        "default": true
      },
      {
        "code": "pt",
        "name": "Portuguese",
        "local": "Português"
      }
    ]
  */
  console.log(results)
})
```

#### `.getSignedUrl()`

Gets a signed URL from a media collection.

```js
api.in('images').getSignedUrl({
  fileName: 'foobar.jpg'
})
```

#### `.getStats()`

Gets collection stats.

```js
api.in('users').getStats()
```

#### `.getStatus()`

Gets the the API status.

```js
api.getStatus()
```

#### `.update(update)`

Updates a list of documents.

```js
api
  .in('users')
  .whereFieldIsLessThan('age', 18)
  .update({
    adult: false
  })
```

### Filters

Filtering methods are used to create a subset of documents that will be affected by subsequent operation terminators.

#### `.goToPage(page)`

Defines the page of documents to be used.

```js
// Example
api.goToPage(3)
```

#### `.limitTo(limit)`

Defines a maximum number of documents to be retrieved.

```js
// Example
api.limitTo(10)
```

#### `.requireFeature(featureCode)`

Queries the API for support of a given feature and throws a `MISSING_FEATURES` error if it's not supported.

```js
// Example
api.requestFeature('aclv1')
```

#### `.sortBy(field, order)`

Selects a field to sort on and the sort direction. Order defaults to ascending (`asc`).

```js
// Example
api.sortBy('age', 'desc')
```

#### `.useFields(fields)`

Selects the fields to be returned in the response. Accepts array format.

```js
// Example
api.useFields(['name', 'age'])
```

#### `.where(query)`

Filters documents using a MongoDB query object or a Aggregation Pipeline array. The methods above are ultimately just syntatic sugar for `where()`. This method can be used for complex queries that require operations not implemented by any other method.

```js
// Example
api.where({name: 'John Doe'})
```

#### `.whereClientIs(value)`

Applicable when in "client mode". Selects the client with ID equal to `value`.

```js
// Example
api.inClients().whereClientIs('testClient')
```

#### `.whereClientIsSelf()`

Applicable when in "client mode". Selects the client associated with the bearer token being used.

```js
// Example
api.inClients().whereClientIsSelf()
```

#### `.whereFieldBeginsWith(field, text)`

Filters documents where `field` begins with `text`.

```js
// Example
api.whereFieldBeginsWith('name', 'john')
```

#### `.whereFieldContains(field, text)`

Filters documents where `field` contains `text`.

```js
// Example
api.whereFieldContains('name', 'john')
```

#### `.whereFieldDoesNotContain(field, text)`

Filters documents `field` does not contain `text`.

```js
// Example
api.whereFieldDoesNotContain('name', 'john')
```

#### `.whereFieldEndsWith(field, text)`

Filters documents where field starts with `text`.

```js
// Example
api.whereFieldEndsWith('name', 'john')
```

#### `.whereFieldExists(field)`

Filters documents that contain a field.

```js
// Example
api.whereFieldExists('name')
```

#### `.whereFieldDoesNotExist(field)`

Filters documents that do not contain a field.

```js
// Example
api.whereFieldDoesNotExist('address')
```

#### `.whereFieldIsEqualTo(field, value)`

Filters documents where `field` is equal to `value`.

```js
// Example
api.whereFieldIsEqualTo('age', 53)
```

#### `.whereFieldIsGreaterThan(field, value)`

Filters documents where `field` is greater than `value`.

```js
// Example
api.whereFieldIsGreaterThan('age', 18)
```

#### `.whereFieldIsGreaterThanOrEqualTo(field, value)`

Filters documents where `field` is greater than or equal to `value`.

```js
// Example
api.whereFieldIsGreaterThanOrEqualTo('age', 19)
```

#### `.whereFieldIsLessThan(field, value)`

Filters documents where `field` is less than `value`.

```js
// Example
api.whereFieldIsLessThan('age', 65)
```

#### `.whereFieldIsLessThanOrEqualTo(field, value)`

Filters documents where `field` is less than or equal to `value`.

```js
// Example
api.whereFieldIsLessThanOrEqualTo('age', 64)
```

#### `.whereFieldIsOneOf(field, matches)`

Filters documents where the value of `field` is one of the elements of `matches`.

```js
// Example
api.whereFieldIsOneOf('name', ['John', 'Jack', 'Peter'])
```

#### `.whereFieldIsNotEqualTo(field, value)`

Filters documents where `field` is not equal to `value`.

```js
// Example
api.whereFieldIsEqualTo('age', 53)
```

#### `.whereFieldIsNotOneOf(field, matches)`

Filters documents where the value of `field` is not one of the elements of `matches`.

```js
// Example
api.whereFieldIsNotOneOf('name', ['Mark', 'Nathan', 'David'])
```

#### `.whereHookNameIs(name)`

Selects the hook with a given name.

```js
// Example
api.whereFieldIsNotOneOf('name', ['Mark', 'Nathan', 'David'])
```

#### `.withComposition(value)`

Defines whether nested documents should be resolved using composition. The default is to let API decide based on the queried collection's settings.

```js
// Example
api.withComposition()
api.withComposition(true) // same as above
api.withComposition(false)
```

### Other methods

#### `.fromEndpoint(endpoint)`

Selects a custom endpoint to use. Please note that unlike collections, custom endpoints do not have a standardised syntax, so it is up to the authors to make sure the endpoint complies with standard DADI API formats, or they will not function as expected.

```js
// Example
api.fromEndpoint('custom-endpoint')
```

#### `.in(collection)`

Selects the collection to use.

```js
// Example
api.in('users')
```

#### `.inClients()`

Selects "client mode", meaning filters and terminators will operate on clients and not on documents.

```js
// Example
api.inClients()
```

#### `.inHooks()`

Selects "hook mode", meaning filters and terminators will operate on hooks and not on documents.

```js
// Example
api.inMedia('images')
```

#### `.inMedia(bucket)`

Selects a media bucket to be used.

```js
// Example
api.inMedia('images')
```

#### `.useDatabase(database)`

Selects the database to use. Overrides any database defined in the initialisation options, and is reset when called without arguments.

```js
// Example
api.useDatabase('testdb')
```
