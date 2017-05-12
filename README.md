# DADI API wrapper

> A high-level library for interacting with DADI API

[![npm (scoped)](https://img.shields.io/npm/v/@dadi/api-wrapper.svg?maxAge=10800&style=flat-square)](https://www.npmjs.com/package/@dadi/api-wrapper)
![coverage](https://img.shields.io/badge/coverage-91%25-brightgreen.svg?style=flat?style=flat-square)
[![Build Status](https://travis-ci.org/dadi/api-wrapper.svg?branch=master)](https://travis-ci.org/dadi/api-wrapper)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)

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
   api.in('users')
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

In addition to all the terminators supported in [API wrapper core](https://github.com/dadi/api-wrapper-core), the following methods are available.

#### `.apply(callback)`

Updates a list of documents with the result of individually applying `callback` to them.

```js
api.in('users')
  .whereFieldExists('gender')
  .apply(document => {
    document.name = (document.gender === 'male') ? (`Mr ${document.name}`) : (`Mrs ${document.name}`)

    return document
  })
```

#### `.find(options)`

Returns a list of documents. This method extends the one defined in [API wrapper core](https://github.com/dadi/api-wrapper-core) with the ability to extract the result set or the metadata block using the `options` parameter.

```js
api.in('users')
  .whereFieldIsGreaterThan('age', 21)
  .useFields(['name', 'age'])
  .find()
```

`options` is one of the following:

- `extractResults` (Boolean): Selects whether just the results array should be returned, rather than the entire API response.
- `extractMetadata` (Boolean): Selects whether just the metadata object should be returned, rather than the entire API response.

### Filters

API wrapper supports all filters provided by [API wrapper core](https://github.com/dadi/api-wrapper-core).
