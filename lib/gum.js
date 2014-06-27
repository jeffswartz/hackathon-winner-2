var async = require('async'),
    request = require('request'),
    util  = require('util');

var GumInterface = function(endpoint, apiKey, apiSecret) {
  this.endpoint = endpoint + apiKey + "/";
  this.apiKey = apiKey;
  this.apiSecret = apiSecret;
  // this.debug = true;
};

GumInterface.prototype.request = function(url, opts, callback) {
  var usableOpts = {
    url: this.endpoint + url,
    headers: {
      "X-TB-PARTNER-AUTH": this.apiKey + ":" + this.apiSecret
    }
  };
  if(opts && opts.json) usableOpts.json = opts.json;
  if(opts && opts.form) usableOpts.form = opts.form;
  if(this.debug) console.log("[GUM] REQUESTING", usableOpts);
  request[opts.method && opts.method.toLowerCase() || "post"](usableOpts, function(err, response, body){
    if(!err) {
      if(response.statusCode == 403) {
        err = new Error("API key or Secret invalid");
        err.statusCode = 403;
        err.body = body;
      } else if(response.statusCode < 200 || response.statusCode > 299) {
        var message;
        if(body) {
          message = body.message;
        } else {
          message = response.statusCode + ": " + body;
        }
        err = new Error("GUM error: " + message);
        err.errorMessage = message;
        if(body) {
          err.unknownParam = body.unknownParam;
          err.repState = body.repState;
          err.customerState = body.customerState;
          err.body = body;          
        }
        err.statusCode = response.statusCode;
      }
    }
    callback(err, response, body);
  });
}

GumInterface.prototype.put = function(url, opts, callback) {
  var options = opts || {};
  options.method = 'PUT';
  this.request(url, options, callback);
};

GumInterface.prototype.post = function(url, opts, callback) {
  var options = opts || {};
  options.method = 'POST';
  this.request(url, options, callback);
};

GumInterface.prototype.get = function(url, opts, callback) {
  var options = opts || {};
  options.method = 'GET';
  this.request(url, options, callback);
};

GumInterface.prototype.delete = function(url, opts, callback) {
  var options = opts || {};
  options.method = 'DELETE';
  this.request(url, options, callback);
};

GumInterface.prototype.registerCallback = function registerGumCallback (callbackName, url, done) {
  this.put('callbacks/' + callbackName, { form: { url: url } }, function(err) {
    if(err) {
      var message = "Failed to register app for " + callbackName + ': ' + (err ? err.toString() : 'Unknown Error');
      done(err);
    } else {  
      if(this.debug) { util.log("Registered GUM callback:" + callbackName+  "->" + url); }
      done();      
    }
  });
};

GumInterface.prototype.registerCallbacks = function(options, done) {
  var callbacks = options.callbacks;
  async.forEach(Object.keys(callbacks), function(name, callbackRegistered){
    this.registerCallback(name, callbacks[name], callbackRegistered);
  }.bind(this), done);
};

GumInterface.prototype._getAvailableCustomers = function(retryCount, callback) {
  this.get('customer?status=available', { json: true }, function(err, response, body){
    if(err && (err.statusCode == 403 || retryCount > 5)) {
      callback(err);
    } else if(err) {
      setTimeout(function(){
        this._getAvailableCustomers(retryCount, callback);
      }.bind(this), 1000);
    } else {
      callback(null, body);
    }
  });
};

GumInterface.prototype.getAvailableCustomers = function(callback) {
  this._getAvailableCustomers(0, callback);
};

GumInterface.prototype._getAvailableReps = function(retryCount, callback) {
  this.get('rep?status=available', { json: true }, function(err, response, body){
    if(err && (err.statusCode == 403 || retryCount > 5)) {
      callback(err);
    } else if(err) {
      setTimeout(function(){
        this._getAvailableReps(retryCount, callback);
      }.bind(this), 1000);
    } else {
      callback(null, body);
    }
  });
};

GumInterface.prototype.getAvailableReps = function(callback) {
  this._getAvailableReps(0, callback);
};

GumInterface.prototype.matchCustomerToARep = function(customer, matchFn, callbackFn) {
  if(!customer) {
    callbackFn(Error("No customer given to matchCustomerToARep"));
    return;
  }
  async.waterfall([

    // Get available reps (automatically retries)
    function(cb) {
      this.getAvailableReps(cb);
    }.bind(this),

    // Invoke the matchFn (if we have reps to match)
    function(reps, cb) {
      if(reps.length == 0) {
        cb(null, null);
        return;
      }
      matchFn(reps, function(rep){
        cb(null, rep);
      });
    },

    // Attempt to match to the chosen rep (if we have one to match to)
    function(rep, cb) {
      if(!rep) {
        cb();
        return;
      }
      this.matchCustomerToRep(customer.id, rep.id, function(err){
        if(err) {
          if(err.statusCode == 409 && !err.customerAvailable) {
            // Customer is either now offline or has already matched
            if(this.debug) console.error("[GUM]", new Date, err.errorMessage);
            cb(err);
          } else {
            // Typically this will because:
            // 1. The Rep has gone offline, or has already been matched to another customer
            // 2. A network error
            // So just re-try.
            if(this.debug) console.log("[GUM]", new Date, err.errorMessage || err.message, "Retrying...");
            setTimeout(function(){
              this.matchCustomerToARep(customer, matchFn, callbackFn);
            }.bind(this), 1000);
          }
          return;
        }
        // Otherwise we matched them. Excellent!
        if(this.debug) console.log("[GUM]", new Date, "Matched customer", customer, "to", rep);
        cb(null, rep);
      }.bind(this));
    }.bind(this)

  ], callbackFn);

};

GumInterface.prototype.matchRepToACustomer = function(rep, matchFn, callbackFn) {
  if(!rep) {
    callbackFn(Error("No rep given to matchRepToACustomer"));
    return;
  }
  async.waterfall([

    // Get available reps (automatically retries)
    function(cb) {
      this.getAvailableCustomers(cb);
    }.bind(this),

    // Invoke the matchFn (if we have reps to match)
    function(customers, cb) {
      if(customers.length == 0) {
        cb(null, null);
        return;
      }
      matchFn(customers, function(customer){
        cb(null, customer);
      });
    },

    // Attempt to match to the chosen rep (if we have one to match to)
    function(customer, cb) {
      if(!customer) {
        cb();
        return;
      }
      this.matchCustomerToRep(customer.id, rep.id, function(err){
        if(err) {
          if(err.statusCode == 409 && !err.repAvailable) {
            // Rep is either now offline or has already matched
            cb(err);
          } else {
            // Typically this will because:
            // 1. The Rep has gone offline, or has already been matched to another customer
            // 2. A network error
            // So just re-try.
            if(this.debug) console.error("[GUM]", new Date, err.errorMessage || err.message, "Retrying...");
            setTimeout(function(){
              this.matchRepToACustomer(rep, matchFn, callbackFn);
            }.bind(this), 1000);
          }
          return;
        }
        // Otherwise we matched them. Excellent!
        cb(null, customer);
      }.bind(this));
    }.bind(this)

  ], callbackFn);
};

GumInterface.prototype.matchCustomerToRep = function(customer, rep, callback) {
  this.post('match?customerId=' + customer + '&repId=' + rep, {}, function(err, response, body) {
    callback(err);
  });
}

GumInterface.prototype.createCustomer = function(customerId, name, data, callback) {
  this.post("customer/" + customerId, { json: { name: name, data: data } }, function(err, response, body){
    if(err) {
      callback(err);
    } else {
      callback(null, {
        sessionId: body.sessionId,
        token: body.token
      });
    }
  }.bind(this));
}

GumInterface.prototype.createRep = function(repId, name, callback) {
  this.post("rep/" + repId, { json: { name: name } }, function(err, response, body){
    if(err) {
      callback(err);
    } else {
      callback(null, {
        sessionId: body.sessionId,
        token: body.token
      });
    }
  }.bind(this));
}

module.exports = GumInterface;