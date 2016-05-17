var DadiAPI = function (options) {
  this.options = options;
  
  this.options.port = this.options.port || 80;
  this.options.tokenUrl = this.options.tokenUrl || '/token';

  this.passportOptions = {
    issuer: {
      uri: options.uri,
      port: options.port,
      endpoint: options.tokenUrl
    },
    credentials: options.credentials,
    wallet: 'file',
    walletOptions: {
      path: __dirname + '/.wallet/token.' + this._slugify(options.uri + options.port) + '.' + this._slugify(options.credentials.clientId) + '.json'
    }
  };
};

// -----------------------------------------
// Attach helpers
// -----------------------------------------

require('./lib/helpers')(DadiAPI);

// -----------------------------------------
// Attach filters
// -----------------------------------------

require('./lib/filters')(DadiAPI);

// -----------------------------------------
// Attach terminators
// -----------------------------------------

require('./lib/terminators')(DadiAPI);

module.exports = DadiAPI;
