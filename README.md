# DADI API wrapper

> A Node.JS library for interacting with DADI API

## Overview

[DADI API](https://github.com/dadi/api) is a high performance RESTful API layer designed in support of API-first development and the principle of COPE. 

This library provides a high-level abstraction of the REST architecture style, exposing a set of chainable methods that allow developers to compose complex read and write operations using a simplistic and natural syntax.

## Getting started

1. Install the `dadi-api-wrapper` module:

   ```shell
   npm install dadi-api-wrapper --save
   ```

2. Add the library and configure the API settings

   ```js
   var DadiAPI = require('dadi-api-wrapper');
   var api = new DadiAPI({
     uri: 'http://api.eb.dev.dadi.technology',
     port: 80,
     credentials: {
       clientId: 'johndoe',
       secret: 'f00b4r'
     },
     version: 'vjoin',
     database: 'testdb'
   });
   ```

3. Make a query

   ```js
   api.in('users')
      .whereFieldContains('name', 'john')
      .whereFieldIsGreaterThan('age', 18)
      .find()
      .then(function (response) {
      	// Use documents here
      });
   ```

## API

Each query consists of a series of chained methods that form the request. Methods are divided in the following categories.

### Selecting a collection

#### .in(collection)