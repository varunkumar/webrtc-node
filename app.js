
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , io = require('socket.io');

/**
 * Configuration.
 */
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3300);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/**
 * Routes.
 */ 
app.get('/', routes.index);

/**
 * Starting the server.
 */
var server = http.createServer(app);
var io = io.listen(server);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
  process.send('online');
});

routes.openSocket(io);

process.on('message', function(message) {
  if (message === 'shutdown') {
    process.exit(0);
  }
});