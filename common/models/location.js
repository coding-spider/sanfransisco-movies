'use strict';

//AIzaSyDFI2Yr28blF9SjV5AF2nQqcT4CZU2zh8g

var async = require('async');
var options = {
  provider: 'google',
  httpAdapter: 'https', // Default
  apiKey: 'AIzaSyDFI2Yr28blF9SjV5AF2nQqcT4CZU2zh8g', // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};

var geocoder = require('node-geocoder')(options);

module.exports = function(Location) {

  Location.observe('before save', function(ctx, next) {
    if (ctx.isNewInstance && ctx.instance) {
      async.retry({
        times: 3,
        interval: 1000
      }, function(callback) {
        geocoder.geocode(ctx.instance.name + " San Francisco, CA", function(err, data) {
          if (!err && data.length) {
            console.log("Location coordinates^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", data);
            ctx.instance.lat = data[0].latitude;
            ctx.instance.lon = data[0].longitude;
            callback(null);
          } else {
            console.log("location not found ", ctx.instance.name, err);
            callback(err);
          }
        });
      }, function(err) {
        return next();
      });
    } else {
      return next();
    }
  });

};
