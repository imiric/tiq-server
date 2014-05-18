#!/usr/bin/env node

/**
 * Module dependencies.
 */
var path = require('path'),
    Hapi = require('hapi'),
    _ = require('lodash'),
    links = require('docker-links').parseLinks(process.env),
    handlers = require('./handlers');

function readJSON(file) {
  try {
    var data = require(file);
  } catch (err) {
    var data = {};
  }
  return data;
}

var defaultConfig = {
  port: 8000,
  database: {
    client: 'pg',
    connection: {
      host: (links.db && links.db.hostname) ? links.db.hostname : 'localhost',
      port: (links.db && links.db.port) ? links.db.port : 5432,
      user: (links.db && links.db.user) ? links.db.user : null,
      password: (links.db && links.db.password) ? links.db.password : null,
    }
  }
};

var configFile = path.join(process.env.XDG_CONFIG_HOME ||
                    path.join(process.env.HOME, '.config'),
                    'tiq-server', 'config.json');

var config = _.extend(defaultConfig, readJSON(configFile));

// Setup the DB plugin
handlers.init(config.database);

var server = Hapi.createServer('0.0.0.0', config.port);

server.route([
  {
    method: 'GET',
    path: '/{namespace}/{text*}',
    handler: handlers.describe
  },
  {
    method: 'POST',
    path: '/{namespace}/{text*}',
    handler: handlers.associate
  },
]);

// Make error response payloads adhere to the schema used for non-errors
server.ext('onPreResponse', function (request, reply) {
  var response = request.response;
  if (!response.isBoom) {
    return reply();
  }

  delete response.output.payload.statusCode;
  delete response.output.payload.error;
  response.output.payload.status = 'error';

  reply(response);
});

if (require.main === module) {
  server.start();
}

module.exports = server;
