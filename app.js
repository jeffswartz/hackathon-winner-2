var _        = require('underscore'),
    express  = require('express'),
    fs       = require('fs'),
    http     = require('http'),
    moniker  = require('moniker'),
    path     = require('path'),
    send     = require('send'),
    uuid     = require('node-uuid'),
    url      = require('url'),
    util     = require('util'),
    Gum      = require('./lib/gum'),
    request  = require('request'),
    app      = express();

// config
config = {
  "port": process.env.PORT || 9393,
  "callbackHost": process.env.URL || "https://otcsf.herokuapp.com/",
  "apiKey": process.env.OTCS_API_KEY,
  "apiSecret": process.env.OTCS_API_SECRET,
  "gumServer": process.env.OTCS_GUM_SERVER || "http://gum.opentok.com/"
  //"gumServer": process.env.OTCS_GUM_SERVER || "http://devgum01-pdx.tokbox.com:9998/"
}
// config errors
if(!(config.apiKey && config.apiSecret)) {
  console.log("You must set OpenTok apiKey and apiSecret in config.json");
  process.exit();
}
if(!config.callbackHost) {
  console.log("You must specify your callback host in cofig.json (e.g. your IP address)")
  process.exit();
}

// Register callbacks
var gum = new Gum(config.gumServer, config.apiKey, config.apiSecret);
gum.registerCallbacks({
  callbacks: {
    incomingCustomer: config.callbackHost + 'hooks/incomingCustomer',
    incomingRep: config.callbackHost + 'hooks/incomingRep',
    customerAnswered: config.callbackHost + 'hooks/customerAnswered',
    customerOffline: config.callbackHost + 'hooks/customerOffline'
  }
}, function(err){
  if(err) {
    console.error(new Date, "Failed to register GUM callbacks:", err.message, err.body);
    process.exit();
  } else {
    util.log("All gum callbacks registered.");
  }
});
//***
//*** register archive callback
//***
var rurl = "https://api.opentok.com" + "/v2/partner/" + config.apiKey + "/callback/";
request({ 
  url: rurl, 
  method: "POST", 
  headers: { 'X-TB-PARTNER-AUTH': config.apiKey + ":" + config.apiSecret }, 
  json: {
    url:"http://otcsf.herokuapp.com/archive-status",
    group: "archive",
    event: "status"
  }
}, function( err, response, body){
  console.log( "archive Callbacks registered" );
  console.log( body );
});


var generator = moniker.generator([moniker.noun]);

// helper functions
function sendJSON(o, res){
  var buffer = JSON.stringify(o);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.writeHead(200, { "Content-Type": "application/json", "Content-Length": buffer.length });
  res.end(buffer);
};

var allCustomers = {};
// all environments
app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(__dirname + '/client/dist'));

app.get("/", function( req, res ){
  res.sendfile( __dirname+"/client/dist/index.html");
});
app.get("/rep", function( req, res ){
  res.sendfile( __dirname+"/client/dist/rep.html");
});
app.get("/app/createCustomer", function( req, res ){
  var customer = {
    customerId: uuid.v4(),
    name: "Ian",
    data: {
      location: 'San Francisco, CA'
    }
  };
  var data = { }
  gum.createCustomer(customer.customerId, customer.name, customer.data, function(err, created){
    allCustomers[ customer.customerId ] = created;
    if(err) {
      console.log("Error creating customer:", err.message || err);
      sendJSON({error:true}, res);
    } else {
      customer.apiKey = config.apiKey;
      customer.sessionId = created.sessionId;
      customer.token = created.token;
      console.log( "created customer successfully" );
      sendJSON(customer, res);
    }
  });
});
app.get("/app/createRep/:name", function( req, res ){
  var name = req.params.name;
  var rep = {
    repId: uuid.v4(),
    name: name
  };
  gum.createRep(rep.repId, rep.name, function(err, created){
    if(err) {
      console.log("Error creating rep:", err.message || err);
      sendJSON({error: true});
    } else {
      rep.apiKey = config.apiKey;
      rep.sessionId = created.sessionId;
      rep.token = created.token;
      console.log( "created rep successfully" );
      sendJSON(rep, res);
    }
  });
});
app.post("/hooks/incomingCustomer", function( req, res ){
  console.log("incomingCustomer received");
  console.log( req.body );
  var body = req.body;
  if(body.customer) {
    var customer = body.customer;
    gum.matchCustomerToARep(
      customer, 
      function(reps, match) {
        match(reps[0]);
      },
      function(err, rep) {
        if(err) {
          console.error(new Date, "Could not match", customer, err);
        } else if (!rep) {
          console.log(new Date, "No rep to match customer", customer, "to.");
        } else {
          console.log(new Date, "Matched customer", customer, "to", rep);    
        }
      }
      );
  }
  res.writeHead(200);
  res.end("OK");
});
app.post("/hooks/incomingRep", function( req, res ){
  console.log("incomingCustomer received");
  console.log( req.body );
  var body = req.body;

  if(body.representative) {
    var rep = body.representative;
    gum.matchRepToACustomer(
      rep, 
      function(customers, match) {
        match(customers[0]);
      },
      function(err, customer) {
        if(err) {
          console.error(new Date, "Could not match", rep, err);
        } else if (!rep) {
          console.log(new Date, "No rep to match customer", rep, "to.");
        } else {
          console.log(new Date, "Matched customer", customer, "to", rep);    
        }
      }
      );
  }
  res.writeHead(200);
  res.end("OK");
});
app.post("/hooks/customerAnswered", function( req, res ){
  console.log("customer has been answered!");
  console.log( req.body );
  console.log( "all customers" );
  console.log( allCustomers );
  console.log( "customer info" );
  console.log( allCustomers[ req.body.customer.id ] );
  var rurl = "https://api.opentok.com" + "/v2/partner/" + config.apiKey + "/archive";
  var body = {
    action: "start", 
    sessionId: allCustomers[ req.body.customer.id ].sessionId,
    name: "Portfolio Review: 2013 #####"+req.body.customer.id
  }
  request({ 
    url: rurl, 
    method: "POST", 
    headers: { 'X-TB-PARTNER-AUTH': config.apiKey + ":" + config.apiSecret }, 
    json: body 
  }, function( err, response, body){
    console.log( "start archive response" );
    if(err) {
      console.log(err);
      res.json({ status: err });
    } else if(!body || body.status != 'started') {
      console.error("Response", response.statusCode, "Body", body);
      res.json({ status: "failed", body: body });
    } else {
      allCustomers[req.body.customer.id].archive = body;
      console.log( "archive id registered to customer" );
      console.log( allCustomers[req.body.customer.id] );
      res.json({ status: "started", id: body.id });
    }
  });
});
app.post("/hooks/customerOffline", function( req, res ){
  console.log("customer has left!");
  console.log( req.body );
  console.log( "all customers" );
  console.log( allCustomers );
  console.log( "customer info" );

  res.writeHead(200);
  res.end("OK");
});
app.post("/archive-status", function( req, res ){
  console.log("archive callback");
  console.log( req.body.status );
  console.log( req.body );
  if( req.body.status == "available" ){
    console.log( "archive available" );
    var name = req.body.name.split( "#####" );
    console.log( name );
    console.log( "customer on archive" );
    console.log( allCustomers[name[1]] );
    allCustomers[name[1]].archive = req.body;
  }
  res.writeHead(200);
  res.end("OK");
});
app.get("/is-archive-ready/:cid", function(req, res){
  console.log( "polling" );
  console.log( req.params.cid );
  console.log( "customer" );
  console.log( allCustomers[req.params.cid] );
  console.log( "archive Information" );
  console.log( allCustomers[req.params.cid].archive );
  // cors
  res.header('Access-Control-Allow-Origin', "*" );
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.json( allCustomers[req.params.cid].archive );
});


app.listen(config.port);
