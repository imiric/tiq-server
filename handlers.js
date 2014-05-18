
/**
 * Module dependencies.
 */
var Tiq = require('tiq-db'),
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
  var tokens = request.payload.tokens,
      tags = request.payload.tags,
      ns = request.params.namespace;

  tiq.associate(tokens, tags, ns).then(function(res) {
    reply(wrapResponse(Result.SUCCESS));
  });
}

/**
 * Get the tags associated with the given tokens.
 */
function describe(request, reply) {
  var tokens = request.query.tags,
      ns = request.params.namespace;

  // In case only a single one was passed
  if (typeof tokens === 'string') {
    tokens = [tokens];
  }

  tiq.describe(tokens, ns).then(function(tags) {
    reply(wrapResponse(Result.SUCCESS, tags));
  });
}
