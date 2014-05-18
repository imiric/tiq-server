
/**
 * Module dependencies.
 */

var expectRequire = require('a').expectRequire,
    Promise = require('bluebird'),
    _ = require('lodash'),
    should = require('chai').should();


var describeStore = {
  singlens: ['test'],
  doublebleh: ['test with multiple tokens'],
  'http://example.com/': ['test with URL']
};

var associateArgs = null;

// Mock tiq-db
expectRequire('tiq-db').return(function() {
  return {
    describe: function(tokens, ns) {
      return Promise.resolve(describeStore[tokens.join('')+ns]);
    },
    associate: function() {
      associateArgs = _.values(arguments);
      return Promise.resolve();
    }
  }
});

var server = require('..');

describe('#associate()', function() {
  it('should associate tags with tokens using namespaces', function(done) {
    var options = {
      method: 'POST',
      url: '/private',
      payload: '{"tokens":["url"],"tags":["test","namespace"]}'
    };

    server.inject(options, function(response) {
      var result = response.result;
      response.statusCode.should.equal(200);
      result.status.should.equal('success');
      associateArgs.should.deep.equal([['url'], ['test', 'namespace'], 'private'])
      done();
    });
  });

  it('should support URLs in token', function(done) {
    var options = {
      method: 'POST',
      url: '/',
      payload: '{"tokens":["http://mycoolsite.com/"],"tags":["cool","test"]}'
    };

    server.inject(options, function(response) {
      var result = response.result;
      response.statusCode.should.equal(200);
      result.status.should.equal('success');
      associateArgs.should.deep.equal([['http://mycoolsite.com/'], ['cool', 'test'], ''])
      done();
    });
  });

  it('should return an error on malformed JSON', function(done) {
    var options = {
      method: 'POST',
      url: '/public',
      payload: '["test"'
    };

    server.inject(options, function(response) {
      var result = response.result;
      response.statusCode.should.equal(400);
      result.status.should.equal('error');
      done();
    });
  });
});

describe('#describe()', function() {
  it('should return the tags associated with the token using namespaces', function(done) {
    var options = {
      method: 'GET',
      url: '/ns?tags=single'
    };

    server.inject(options, function(response) {
      var result = response.result;
      response.statusCode.should.equal(200);
      result.status.should.equal('success');
      result.data.should.deep.equal(['test']);
      done();
    });
  });

  it('should return the tags associated with multiple tokens', function(done) {
    var options = {
      method: 'GET',
      url: '/?tags=double&tags=bleh'
    };

    server.inject(options, function(response) {
      var result = response.result;
      response.statusCode.should.equal(200);
      result.status.should.equal('success');
      result.data.should.deep.equal(['test with multiple tokens']);
      done();
    });
  });

  it('should support URLs in token', function(done) {
    var options = {
      method: 'GET',
      url: '/?tags=http://example.com/'
    };

    server.inject(options, function(response) {
      var result = response.result;
      response.statusCode.should.equal(200);
      result.status.should.equal('success');
      result.data.should.deep.equal(['test with URL'])
      done();
    });
  });

  it('should support encoded URLs in token', function(done) {
    var options = {
      method: 'GET',
      url: '/?tags=http%3A%2F%2Fexample.com%2F'
    };

    server.inject(options, function(response) {
      var result = response.result;
      response.statusCode.should.equal(200);
      result.status.should.equal('success');
      result.data.should.deep.equal(['test with URL'])
      done();
    });
  });
});
