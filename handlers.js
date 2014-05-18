
/**
 * Module dependencies.
 */
var Tiq = require('tiq-db'),
    Hapi = require('hapi'),
    _ = require('lodash'),
    tiq;

exports = module.exports = {
  init: function(config) {
    tiq = Tiq(config);
  },
  associate: associate,
  describe: describe
}

// Enum to standardize response status text
var Result = {
  SUCCESS: 'success',
  FAIL:    'fail',
  ERROR:   'error'
}

/**
 * Wraps the response data in a uniform object.
 */
function wrapResponse(result, data, extra) {
  return _.merge(
    {status: result},
    data ? {data: data} : {},
    extra || {}
  );
}


/**
 * Associate a collection of tokens with a collection of tags.
 */
function associate(request, reply) {
  var tokens = request.params.text.split(request.query.separator || ','),
      tags = request.payload,
      ns = request.params.namespace;

  tiq.associate(tokens, tags, ns).then(function(res) {
    reply(wrapResponse(Result.SUCCESS));
  });
}

/**
 * Get the tags associated with the given tokens.
 */
function describe(request, reply) {
  var tokens = request.params.text.split(request.query.separator || ','),
      ns = request.params.namespace;

  tiq.describe(tokens, ns).then(function(tags) {
    reply(wrapResponse(Result.SUCCESS, tags));
  });
}
