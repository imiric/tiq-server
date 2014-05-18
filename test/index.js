
/**
 * Module dependencies.
 */

var expectRequire = require('a').expectRequire,
    Promise = require('bluebird'),
    _ = require('lodash'),
    should = require('chai').should();


var describeStore = {
  single: ['test'],
  double: ['test with multiple tokens'],
  'http://example.com/': ['test with multiple tokens and custom sep']
};

var associateArgs = null;

// Mock tiq-db
expectRequire('tiq-db').return(function() {
  return {
    describe: function(tokens, ns) {
      return Promise.resolve(describeStore[tokens[0]]);
    },
    associate: function() {
      associateArgs = _.values(arguments);
      return Promise.resolve();
    }
  }
});

var server = require('..');

describe('associate', function() {
  it('should associate tags with tokens using namespaces', function(done) {
    var options = {
      method: 'POST',
      url: '/public/url',
      payload: '["test","namespace"]'
    };

    server.inject(options, function(response) {
      var result = response.result;
      response.statusCode.should.equal(200);
      result.status.should.equal('success');
      associateArgs.should.deep.equal([['url'], ['test', 'namespace'], 'public'])
      done();
    });
  });

  it('should support URLs in token', function(done) {
    var options = {
      method: 'POST',
      url: '/public/http://mycoolsite.com/',
      payload: '["cool","test"]'
    };

    server.inject(options, function(response) {
      var result = response.result;
      response.statusCode.should.equal(200);
      result.status.should.equal('success');
      associateArgs.should.deep.equal([['http://mycoolsite.com/'], ['cool', 'test'], 'public'])
      done();
    });
  });

  it('should return an error on malformed JSON', function(done) {
    var options = {
      method: 'POST',
      url: '/public/url',
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

describe('describe', function() {
  it('should return the tags associated with the token using namespaces', function(done) {
    var options = {
      method: 'GET',
      url: '/public/single'
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
      url: '/public/double,bleh'
    };

    server.inject(options, function(response) {
      var result = response.result;
      response.statusCode.should.equal(200);
      result.status.should.equal('success');
      result.data.should.deep.equal(['test with multiple tokens']);
      done();
    });
  });

  it('should return the tags associated with multiple tokens using a custom separator', function(done) {
    var options = {
      method: 'GET',
      url: '/public/http://example.com/|http://asdf.com?separator=|'
    };

    server.inject(options, function(response) {
      var result = response.result;
      response.statusCode.should.equal(200);
      result.status.should.equal('success');
      result.data.should.deep.equal(['test with multiple tokens and custom sep']);
      done();
    });
  });
});
