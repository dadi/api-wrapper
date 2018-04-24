const apiWrapper = require(__dirname + '/../../index')
const should = require('should')
const sinon = require('sinon')
const url = require('url')

const MockModel = function (name) {}

MockModel.prototype._mockData = [
  {_id: 1, name: 'Jane', age: 20},
  {_id: 2, name: 'John', age: 23}
]

MockModel.prototype.create = function (parameters) {
  return Promise.resolve({
    results: parameters.documents
  })
}

MockModel.prototype.delete = function () {
  return Promise.resolve({
    deletedCount: 1,
    totalCount: 1
  })
}

MockModel.prototype.get = function () {
  return Promise.resolve({
    results: this._mockData,
    metadata: {
      totalCount: this._mockData.length
    }
  })
}

MockModel.prototype.update = function (parameters) {
  let results = this._mockData.map(document => {
    return Object.assign({}, document, parameters.update)
  })

  return Promise.resolve({
    results
  })
}

const namespace = {
  MockModel: MockModel
}

let factory = modelName => new namespace.MockModel(modelName)
let instance
let spies = {
  constructor: sinon.spy(namespace, 'MockModel'),
  create: sinon.spy(MockModel.prototype, 'create'),
  delete: sinon.spy(MockModel.prototype, 'delete'),
  get: sinon.spy(MockModel.prototype, 'get'),
  update: sinon.spy(MockModel.prototype, 'update')
}

describe('API module integration', () => {
  beforeEach(() => {
    instance = new apiWrapper(factory)
  })

  afterEach(() => {
    Object.keys(spies).forEach(name => {
      spies[name].resetHistory()
    })
  })

  describe('create()', () => {
    it('should call the `create` method in API model with the correct parameters when creating a single document', () => {
      let mockData = {
        name: 'Eduardo',
        age: 150
      }

      return instance
        .in('users')
        .create(mockData)
        .then(response => {
          response.results.should.eql(mockData)

          spies.constructor.getCall(0).args[0].should.eql('users')
          spies.create.getCall(0).args[0].documents.should.eql(mockData)
        })
    })

    it('should call the `create` method in API model with the correct parameters when creating multiple documents', () => {
      let mockData = [
        {
          name: 'Eduardo',
          age: 150
        },
        {
          name: 'Jim',
          age: 200
        }
      ]

      return instance
        .in('users')
        .create(mockData)
        .then(response => {
          response.results.should.eql(mockData)

          spies.constructor.getCall(0).args[0].should.eql('users')
          spies.create.getCall(0).args[0].documents.should.eql(mockData)
        })
    })
  })

  describe('delete()', () => {
    it('should call the `delete` method in API model with the correct parameters when creating a single document', () => {
      return instance
        .in('users')
        .whereFieldIsEqualTo('name', 'John')
        .delete()
        .then(response => {
          response.deletedCount.should.be.Number
          response.totalCount.should.be.Number

          spies.constructor.getCall(0).args[0].should.eql('users')
          spies.delete.getCall(0).args[0].query.should.eql({
            name: 'John'
          })
        })
    })
  })  

  describe('find()', () => {
    it('should call the `get` method in API model with the correct parameters', () => {
      return instance
        .in('users')
        .whereFieldIsEqualTo('first_name', 'John')
        .whereFieldContains('last_name', 'Doe')
        .useFields(['field1', 'field2'])
        .withComposition()
        .find()
        .then(response => {
          response.results.should.eql(MockModel.prototype._mockData)

          spies.constructor.getCall(0).args[0].should.eql('users')
          spies.get.getCall(0).args[0].query.should.eql({
            first_name: 'John',
            last_name: {
              $regex: 'Doe'
            }
          })
          spies.get.getCall(0).args[0].options.should.eql({
            compose: true,
            fields: {field1: 1, field2: 1}
          })
        })
    })

    it('should call the `get` method in API model with the correct parameters and return the results if `extractResults` is supplied', () => {
      return instance
        .in('users')
        .whereFieldIsEqualTo('first_name', 'John')
        .whereFieldContains('last_name', 'Doe')
        .useFields(['field1', 'field2'])
        .withComposition()
        .find({extractResults: true})
        .then(response => {
          response.should.eql(MockModel.prototype._mockData)

          spies.constructor.getCall(0).args[0].should.eql('users')
          spies.get.getCall(0).args[0].query.should.eql({
            first_name: 'John',
            last_name: {
              $regex: 'Doe'
            }
          })
          spies.get.getCall(0).args[0].options.should.eql({
            compose: true,
            fields: {field1: 1, field2: 1}
          })
        })
    })
  })

  describe('update()', () => {
    it('should call the `update` method in API model with the correct parameters', () => {
      return instance
        .in('users')
        .whereFieldIsEqualTo('first_name', 'John')
        .whereFieldContains('last_name', 'Doe')
        .update({
          unknownIdentity: true
        })
        .then(response => {
          response.results.should.be.Object

          spies.constructor.getCall(0).args[0].should.eql('users')
          spies.update.getCall(0).args[0].query.should.eql({
            first_name: 'John',
            last_name: {
              $regex: 'Doe'
            }
          })
          spies.update.getCall(0).args[0].update.should.eql({
            unknownIdentity: true
          })
        })
    })
  })  
})
