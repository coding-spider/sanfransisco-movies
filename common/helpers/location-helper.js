var app = require('../../server/server');
var async = require('async');
var exports = module.exports = {};

exports.locationInsert = function(name, modelInto, callback) {
  if (!name) {
    return callback();
  }
  var Location = app.models.location;
  Location.findOrCreate({
    where: {
      name: name
    }
  }, {
    name: name
  }, function(err, instance, created) {
    if (err) {
      return callback(err);
    }
    modelInto.locations.add(instance, function(err) {
      if (err) {
        return callback(err);
      }
      callback();
    });
  });
}
