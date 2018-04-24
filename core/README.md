# DADI API wrapper (core)

> Core high-level methods for interacting with DADI API

[![npm (scoped)](https://img.shields.io/npm/v/@dadi/api-wrapper-core.svg?maxAge=10800&style=flat-square)](https://www.npmjs.com/package/@dadi/api-wrapper-core)
![coverage](https://img.shields.io/badge/coverage-95%25-brightgreen.svg?style=flat?style=flat-square)
[![Build Status](https://travis-ci.org/dadi/api-wrapper-core.svg?branch=master)](https://travis-ci.org/dadi/api-wrapper-core)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)

## Overview

[DADI API](https://github.com/dadi/api) is a high performance RESTful API layer designed in support of API-first development and the principle of COPE.

This package exposes a set of chainable methods that allow developers to compose complex read and write operations using a simplistic and natural syntax, providing a high-level abstraction of the REST architectural style.

It can be used as a standalone module to generate request objects containing information about the HTTP verb, URL and payload, or used in conjunction with [DADI API Wrapper](https://github.com/dadi/api-wrapper) to provide a full-featured API consumer, capable of handling authentication and the HTTP communication.

## Getting started

1. Install the `@dadi/api-wrapper-core` module:

   ```shell
   npm install @dadi/api-wrapper-core --save
   ```

2. Add the library and configure the API settings:

   ```js
   const APIWrapper = require('@dadi/api-wrapper-core')

   const api = new APIWrapper({
     uri: 'http://api.example.com',
     port: 80,
     version: 'vjoin',
     database: 'testdb'
   })
   ```

3. Make a query:

   ```js
   // Example: getting all documents where `name` contains "john" and age is greater than 18
   const requestObject = api
    .in('users')
    .whereFieldContains('name', 'john')
    .whereFieldIsGreaterThan('age', 18)
    .find()
   ```

## Methods

Each query consists of a series of chained methods to form the request, always containing a terminator method. Terminators return a Promise with the result of one or more requests to the database and can make use of a series of [filtering methods](#filters) to create the desired subset of documents to operate on.

### Terminators

#### `.create()`

Creates a document.

```js
// Example
api.in('users')
   .create({
      name: 'John Doe',
      age: 45,
      address: '123 Fake St'
   })
   .then(function (doc) {
      console.log('New document:', doc)
   })
   .catch(function (err) {
      console.log('! Error:', err)
   })
```

*Output:*

```json
{
  "body": {
    "name": "John Doe",
    "age": 45,
    "address": "123 Fake St"
  },
  "method": "POST",
  "uri": {
    "href": "http://api.example.com:80/vjoin/testdb/users",
    "hostname": "api.example.com",
    "path": "/vjoin/testdb/users",
    "port": "80",
    "protocol": "http:"
  }
}
```


#### `.delete()`

Deletes one or more documents.

```js
api.in('users')
   .whereFieldDoesNotExist('name')
   .delete()
```

*Output:*

```json
{
  "body": {
    "query": {
      "name": {
        "$eq": null
      }
    }
  },
  "method": "DELETE",
  "uri": {
    "href": "http://api.example.com:80/vjoin/testdb/users",
    "hostname": "api.example.com",
    "path": "/vjoin/testdb/users",
    "port": "80",
    "protocol": "http:"
  }
}
```

#### `.find()`

Returns a list of documents.

```js
api.in('users')
   .whereFieldIsGreaterThan('age', 21)
   .useFields(['name', 'age'])
   .find()
```

*Output:*

```json
{
  "method": "GET",
  "uri": {
    "href": "http://api.example.com:80/vjoin/testdb/users?filter={\"age\":{\"$gt\":21}}&fields={\"name\":1,\"age\":1}",
    "hostname": "api.example.com",
    "path": "/vjoin/testdb/users?filter={\"age\":{\"$gt\":21}}&fields={\"name\":1,\"age\":1}",
    "port": "80",
    "protocol": "http:"
  }
}
```

#### `.getCollections()`

Gets the list of collections for the API.

```js
api.getCollections()
```

*Output:*

```json
{
  "method": "GET",
  "uri": {
    "href": "http://api.example.com:80/api/collections",
    "hostname": "api.example.com",
    "path": "/api/collections",
    "port": "80",
    "protocol": "http:"
  }
}
```

#### `.getConfig()`

Gets the config for a collection or for the API.

```js
// Gets the collection config
api.in('users')
   .getConfig()
```

*Output:*

```json
{
  "method": "GET",
  "uri": {
    "href": "http://api.example.com:80/vjoin/testdb/users/config",
    "hostname": "api.example.com",
    "path": "/vjoin/testdb/users/config",
    "port": "80",
    "protocol": "http:"
  }
}
```

```js
// Gets the API config
api.getConfig()
```

*Output:*

```json
{
  "method": "GET",
  "uri": {
    "href": "http://api.example.com:80/api/config",
    "hostname": "api.example.com",
    "path": "/api/config",
    "port": "80",
    "protocol": "http:"
  }
}
```

#### `.getSignedUrl()`

Gets a signed URL from a media collection.

```js
api.in('images')
   .getSignedUrl({
    fileName: "foobar.jpg"
   })
```

*Output:*

```json
{
  "body": {
    "fileName": "foobar.jpg"
  },
  "method": "POST",
  "uri": {
    "href": "http://api.example.com:80/media/images/sign",
    "hostname": "api.example.com",
    "path": "/media/images/sign",
    "port": "80",
    "protocol": "http:"
  }
}
```

#### `.getStats()`

Gets collection stats.

```js
api.in('users')
   .getStats()
```

*Output:*

```json
{
  "method": "GET",
  "uri": {
    "href": "http://api.example.com:80/api/stats",
    "hostname": "api.example.com",
    "path": "/api/stats",
    "port": "80",
    "protocol": "http:"
  }
}
```

#### `.getStatus()`

Gets the the API status.

```js
api.getStatus()
```

*Output:*

```json
{
  "method": "POST",
  "uri": {
    "href": "http://api.example.com:80/api/status",
    "hostname": "api.example.com",
    "path": "/api/status",
    "port": "80",
    "protocol": "http:"
  }
}
```

#### `.setConfig()`

Sets the config for a collection or for the API.

```js
// Sets the collection config
var collectionConfig = {cache: false}

api.in('users')
   .setConfig(collectionConfig)
```

*Output:*

```json
{
  "body": {
    "cache": false
  },
  "method": "POST",
  "uri": {
    "href": "http://api.example.com:80/vjoin/testdb/users/config",
    "hostname": "api.example.com",
    "path": "/vjoin/testdb/users/config",
    "port": "80",
    "protocol": "http:"
  }
}
```

```js
// Sets the API config
var apiConfig = {cors: true}

api.setConfig(apiConfig)
```

*Output:*

```json
{
  "body": {
    "cors": true
  },
  "method": "POST",
  "uri": {
    "href": "http://api.example.com:80/api/config",
    "hostname": "api.example.com",
    "path": "/api/config",
    "port": "80",
    "protocol": "http:"
  }
}
```

#### `.update(update)`

Updates a list of documents.

```js
api.in('users')
   .whereFieldIsLessThan('age', 18)
   .update({
      adult: false
   })
```

*Output:*

```json
{
  "body": {
    "query": {
      "age": {
        "$lt": 18
      }
    },
    "update": {
      "adult": false
    }
  },
  "method": "PUT",
  "uri": {
    "href": "http://api.example.com:80/vjoin/testdb/users",
    "hostname": "api.example.com",
    "path": "/vjoin/testdb/users",
    "port": "80",
    "protocol": "http:"
  }
}
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

#### `.useVersion(version)`

Selects the version to use. Overrides any version defined in the initialisation options, and is reset when called without arguments.

```js
// Example
api.useVersion('1.0')
```

### Defining a callback

By default, calling a terminator will return a request object, which is a plain JavaScript object formed of `method`, `uri` and, optionally, `body`. Alternatively, you can choose to specify what exactly terminators will return, by defining a callback that will be executed before they return. This callback will receive the request object as an argument, giving you the option to modify it or wrap it with something else.

A callback is defined by setting a `callback` property on the options object used to initialise API wrapper.

```js
const APIWrapper = require('@dadi/api-wrapper-core')

const api = new APIWrapper({
  uri: 'http://api.example.com',
  port: 80,
  version: 'vjoin',
  database: 'testdb',
  callback: function (requestObject) {
    // This callback will return a JSON-stringified version
    // of the request object.
    return JSON.stringify(requestObject)
  }
})
```

### Debug mode

With debug mode, you'll be able to see exactly how the requests made to API look like. This functionality is enabled by setting a `debug` property in the config:

```js
const APIWrapper = require('@dadi/api-wrapper-core')
const api = new APIWrapper({
  uri: 'http://api.example.com',
  port: 80,
  version: 'vjoin',
  database: 'testdb',
  debug: true
})
```
