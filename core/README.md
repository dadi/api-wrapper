# DADI API wrapper (core)

> Core high-level methods for interacting with DADI API

[![npm (scoped)](https://img.shields.io/npm/v/@dadi/api-wrapper-core.svg?maxAge=10800&style=flat-square)](https://www.npmjs.com/package/@dadi/api-wrapper-core)
[![Build Status](https://travis-ci.org/dadi/api-wrapper.svg?branch=master)](https://travis-ci.org/dadi/api-wrapper)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)

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

See the documentation on the [main package](https://github.com/dadi/api-wrapper).

## Defining a callback

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
