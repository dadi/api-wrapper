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

## Methods

Each query consists of a series of chained methods that form the request. There are 3 terminating operations that return a Promise with the result of one or more requests to the database: `create()`, `delete()` and `find()`.

`delete()` and `find()` operations can make use of a series of filtering methods to create the desired subset of documents to operate on.

### Operations

#### `create()`

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
      console.log('New document:', doc);
   })
   .catch(function (err) {
      console.log('! Error:', err);
   });
```

#### `delete()`

Deletes one or more documents.

```js
api.in('users')
   .whereFieldDoesNotExist('name')
   .delete()
```

#### `find()`

Returns a list of documents.

```js
api.in('users')
   .whereFieldIsGreaterThan('age', 21)
   .useFields(['name', 'age'])
   .find()
```

### Filters

Filtering methods are used to create a subset of documents that will be affected by subsequent `find()`, `update()` or `delete()` methods.

#### `.useFields(fields)`

Selects the fields to be returned in the response. Accepts array format.

```js
// Example
api.useFields(['name', 'age']);
```

#### `.whereFieldContains(field, text)`

Filters documents that contain `text`. Uses the regular expression `/text/i`.

```js
// Example
api.whereFieldContains('name', 'john');
```

#### `.whereFieldExists(field)`

Filters documents that contain a field.

```js
// Example
api.whereFieldExists('name');
```

#### `.whereFieldDoesNotExist(field)`

Filters documents that do not contain a field.

```js
// Example
api.whereFieldDoesNotExist('address');
```

#### `.whereFieldIsEqualTo(field, value)`

Filters documents where `field` is equal to `value`.

```js
// Example
api.whereFieldIsEqualTo('age', 53);
```

#### `.whereFieldIsGreaterThan(field, value)`

Filters documents where `field` is greater than `value`.

```js
// Example
api.whereFieldIsGreaterThan('age', 18);
```

#### `.whereFieldIsGreaterThanOrEqualTo(field, value)`

Filters documents where `field` is greater than or equal to `value`.

```js
// Example
api.whereFieldIsGreaterThanOrEqualTo('age', 19);
```

#### `.whereFieldIsLessThan(field, value)`

Filters documents where `field` is less than `value`.

```js
// Example
api.whereFieldIsLessThan('age', 65);
```

#### `.whereFieldIsLessThanOrEqualTo(field, value)`

Filters documents where `field` is less than or equal to `value`.

```js
// Example
api.whereFieldIsLessThanOrEqualTo('age', 64);
```

#### `.whereFieldIsOneOf(field, matches)`

Filters documents where the value of `field` is one of the elements of `matches`.

```js
// Example
api.whereFieldIsOneOf('name', ['John', 'Jack', 'Peter']);
```

#### `.whereFieldIsNotOneOf(field, matches)`

Filters documents where the value of `field` is not one of the elements of `matches`.

```js
// Example
api.whereFieldIsNotOneOf('name', ['Mark', 'Nathan', 'David']);
```

#### `.where(query)`

Filters documents using a MongoDB query object or a Aggregation Pipeline array. The above methods are syntatic sugar for `where()`, which should be used for complex queries that require operations not implemented by any other method.

```js
// Example
api.where({name: 'John Doe'});
```

### Other methods

#### `.extractResults()`

Selects whether the entire API response should be returned (`false`) or just the results array (`true`). Defaults to `false`.

```js
// Example
api.extractResults();
```

#### `.in(collection)`

Selects the collection to use.

```js
// Example
api.in('users');
```

#### `useDatabase(database)`

Selects the database to use. Overrides any database defined in the initialisation options, and is reset when called without arguments.

```js
// Example
api.withDatabase('testdb');
```

#### `useVersion(version)`

Selects the version to use. Overrides any version defined in the initialisation options, and is reset when called without arguments.

```js
// Example
api.withVersion('1.0');
```

