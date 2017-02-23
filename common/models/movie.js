'use strict';

var app = require('../../server/server');
var locationInsert = require('../helpers/location-helper').locationInsert;
var async = require('async');

module.exports = function(Movie) {

  Movie.observe('before save', function(ctx, next) {
    var Director = app.models.director;
    if (ctx.isNewInstance && ctx.instance) {
      if (ctx.instance.directorName) {
        Director.findOne({
          where: {
            name: ctx.instance.directorName
          }
        }, function(err, foundDirector) {
          if (err) {
            return next(err);
          }
          if (!foundDirector) {
            //Create new director
            console.log("Pringint director", ctx.instance.directorName);
            Director.create({
              name: ctx.instance.directorName
            }, function(err, createdDirector) {
              if (err) {
                console.log("Error creating director");
                return next(err);
              }
              delete ctx.instance.directorName;
              ctx.instance.directorId = createdDirector.id;
              return next();
            });
          } else {
            //Map existing director
            delete ctx.instance.directorName;
            ctx.instance.directorId = foundDirector.id;
            return next();
          }
        });
      } else {
        return next();
      }
    } else {
      return next();
    }
  });

  Movie.observe('after save', function(ctx, next) {
    console.log("after save triggred");
    if (ctx.isNewInstance && ctx.instance) {
      console.log("Found instance");
      var movie = ctx.instance;
      var locations = ctx.instance.locationArray;
      console.log("Locations ********************************", locations);
      async.eachSeries(locations, function(location, locationCallback) {
        locationInsert(location, ctx.instance, locationCallback);
      }, function(err) {
        if (err) {
          return next(err);
        }
        return next();
      });
    } else {
      return next();
    }

  });

};
