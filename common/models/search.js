'use strict';

var app = require('../../server/server');

module.exports = function(Search) {

  Search.autocomplete = function(q, type, callback) {
    if (type == 'movie') {
      var Movie = app.models.movie;
      Movie.find({
        where: {
          title: {
            like: q,
            options: 'gi'
          }
        },
        limit: 10
      }, function(err, movies) {
        if (err) {
          console.log(err);
          return callback(null, []);
        }
        return callback(null, movies);
      })
    } else {
      //TODO: using director name
      return callback(null, []);
    }
  }

  Search.remoteMethod('autocomplete', {
    http: {
      verb: 'get'
    },
    accepts: [
      {
        arg: 'q',
        type: 'string',
        required: true
      }, {
        arg: 'type',
        type: 'string',
        required: true
      }
    ],
    returns: {
      type: 'object',
      root: true
    }
  });

  Search.exactmatch = function(q, type, callback) {
    if (type == 'movie') {
      var Movie = app.models.movie;
      Movie.find({
        where: {
          title: {
            like: q,
            options: 'i'
          }
        },
        include: ['locations'],
        limit: 10
      }, function(err, movies) {
        if (err) {
          console.log(err);
          return callback(null, []);
        }
        return callback(null, movies);
      })
    } else {
      //TODO: using director name
      return callback(null, []);
    }
  }

  Search.remoteMethod('exactmatch', {
    http: {
      verb: 'get'
    },
    accepts: [
      {
        arg: 'q',
        type: 'string',
        required: true
      }, {
        arg: 'type',
        type: 'string',
        required: true
      }
    ],
    returns: {
      type: 'object',
      root: true
    }
  });

};
