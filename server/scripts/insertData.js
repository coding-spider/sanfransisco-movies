var app = require('../server');
var request = require('request');
var async = require('async');
var _ = require('lodash');
var Movie = app.models.movie;

request("https://data.sfgov.org/resource/wwmu-gmzc.json", function(err, response, body) {
  if (!err && response.statusCode == 200) {
    var movieData = JSON.parse(body);

    console.log("Movie data received", movieData.length);

    getFormattedMovieData(movieData, function(formattedData) {
      async.eachSeries(formattedData, function(movie, acb) {
        console.log("Printing movie &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&", movie);
        Movie.findOne({
          where: {
            title: movie.title
          }
        }, function(err, foundMovie) {
          if (err) {
            console.log(err);
            return acb(err);
          }
          if (!foundMovie) {
            //createMovie
            Movie.create(movie, function(err, createdMovie) {
              if (err) {
                console.log(err);
                return acb(err);
              }
              console.log("Movie created :::::::::::::::::::::::::", createdMovie);
              return acb();
            });
          } else {
            return acb();
          }
        });
      }, function(err) {
        if (err) {
          console.log(err);
          process.exit(1);
        }
        console.log("All movies created");
        process.exit(0);
      });
    });
  } else {
    console.log("Error retreiving data.");
  }
});

function getFormattedMovieData(movies, callback) {
  //group by title
  var groupedData = _.groupBy(movies, function(movie) {
    return movie.title;
  });

  console.log("Grouped data length", Object.keys(groupedData).length);

  var returnArray = [];

  //create location array
  for (movieTitle in groupedData) {
    var movieObj = {
      directorName: groupedData[movieTitle][0].director
        ? groupedData[movieTitle][0].director
        : '',
      distributor: groupedData[movieTitle][0].distributor
        ? groupedData[movieTitle][0].distributor
        : '',
      locationArray: [],
      writer: groupedData[movieTitle][0].writer
        ? groupedData[movieTitle][0].writer
        : '',
      releaseYear: groupedData[movieTitle][0].release_year
        ? groupedData[movieTitle][0].release_year
        : '',
      title: movieTitle,
      productionCompany: groupedData[movieTitle][0].production_company
        ? groupedData[movieTitle][0].production_company
        : '',
      actors: []
    }
    if (groupedData[movieTitle][0].actor_1) {
      movieObj['actors'].push(groupedData[movieTitle][0].actor_1);
    }
    if (groupedData[movieTitle][0].actor_2) {
      movieObj['actors'].push(groupedData[movieTitle][0].actor_2);
    }
    if (groupedData[movieTitle][0].actor_3) {
      movieObj['actors'].push(groupedData[movieTitle][0].actor_3);
    }
    groupedData[movieTitle].forEach(function(movie) {
      if (movie.locations) {
        movieObj.locationArray.push(movie.locations);
      }
    });
    returnArray.push(movieObj);
  }

  return callback(returnArray);

}
