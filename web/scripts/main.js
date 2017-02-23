$(document).ready(function() {

  // Starting location is San Francisco
  var startingLocation = {
    lat: 37.773972,
    lng: -122.431297
  };

  /** Map Module **/
  var Map = (function(initialLocation) {
    var module = {};

    // Default starting location is San Francisco
    var startingLocation = initialLocation || {
      lat: 37.773972,
      lng: -122.431297
    };

    // Markers
    var markers = [];

    // One info window for the map
    var infoWindow = new google.maps.InfoWindow();

    // Google Map
    var map = new google.maps.Map(document.getElementById('map'), {
      center: startingLocation,
      zoom: 13
    });

    var addInfoWindow = function(marker, data) {
      // Add a listener to the marker to open up an info window
      marker.addListener('click', function() {
        infoWindow.setContent(data);
        infoWindow.open(map, marker);
      });
    };

    /** Public Functions **/
    module.addMarker = function(location, data) {
      // Create and add marker to the map
      var marker = new google.maps.Marker({position: location, map: map});

      // Push marker to markers array
      markers.push(marker);

      // Add info window
      addInfoWindow(marker, data);
    };

    // Clears all markers from map
    module.clearMarkers = function() {
      // Must manuall set references to null to avoid memory leaks
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
      }
      markers = [];
    };

    return module;
  }(startingLocation));

  var setUnderscoreDefaultSettings = function() {
    _.templateSettings = {
      interpolate: /\{\{(.+?)\}\}/g, // print value: {{ value_name }}
      evaluate: /\{%([\s\S]+?)%\}/g, // excute code: {% code_to_execute %}
      escape: /\{%-([\s\S]+?)%\}/g // excape HTML: {%- <script> %} prints &lt;script&gt;
    };
  }
  setUnderscoreDefaultSettings();

  /** Autocomplete **/
  $("#search_input").autocomplete({
    delay: 300, // Delay between keystrokes and fetch request
    minLength: 3, // Minimum length of input for autocomplete
    source: function(request, response) {
      var type = $('.nav-pills .active').attr("value");

      // Make call to server to get autocomplete results
      $.getJSON('/api/searches/autocomplete', {
        q: request.term,
        type: type
      }, function(data, status, xhr) {

        // Reformat the results to match the accepted signature of JQuery Autocomplete's Source
        var mappedResults = data.map(function(d) {
          d.label = (type == "movie")
            ? d.title
            : (d.director || d.name);
          d.value = d.label;
          return d;
        });

        // Load jquery ui results
        response(mappedResults);
      });
    },
    select: function(event, ui) {
      var type = $('.nav-pills .active').attr("value");

      // Clear all map markers
      Map.clearMarkers();
      // Get all movie locations by title then geocode their addresses to place on map
      getLocations(type, ui.item);
    }
  });

  /** Listeners **/

  $("#search_button").click(function() {
    var text = $("#search_input").val();
    var type = $('.nav-pills .active').attr("value");

    // Clear all map markers
    Map.clearMarkers();

    // Get all movie locations by title then geocode their addresses to place on map
    getLocations(type, null, text);
  });

  /** Helpers **/

  /**
		* Searches for all movie locations given an movie id, or director id
		* param {string} endpoint - Server endpoint
		* param {string} id - Movie or direcotr id
		* param {string} tab - Current tab the search is under (ie. Title or Director)
		* param {string} title - Search by movie titles, used for clicking search
		*/
  var getLocations = function(type, movie, q) {
    var markerTemplate = _.template($("#markerDom").html());
    if (movie) {
      //No exact match
      $.getJSON('api/movies/' + movie.id, {
        filter: {
          include: ['locations']
        }
      }, function(data) {
        console.log("Dataaa", data);
        if (!data.length) {
          // Show help information if no results
          $(".help_container").css('visibility', 'visible');
        } else {
          // Hide help information
          $(".help_container").css('visibility', 'hidden');
          // Add all the movies location top the map
          data.locations.forEach(function(d) {
            if (d.lat && d.lon) {
              var point = {
                lat: parseFloat(d.lat),
                lng: parseFloat(d.lon)
              };
              Map.addMarker(point, markerTemplate({
                title: movie.title,
                location: d.name,
                releaseYear: movie.releaseYear,
                director: movie.director
                  ? movie.director.name
                  : '',
                actors: movie.actors
                  ? movie.actors.join(",")
                  : '',
                productionCompany: movie.productionCompany
                  ? movie.productionCompany
                  : ''
              }));
            }
          });
        }
      });
    } else {
      //Exact match
      $.getJSON('/api/searches/exactmatch', {
        q: q,
        type: type
      }, function(data) {
        console.log("Dataaa", data);
        if (!data.length) {
          // Show help information if no results
          $(".help_container").css('visibility', 'visible');
        } else {
          // Hide help information
          $(".help_container").css('visibility', 'hidden');
          // Add all the movies location top the map
          data.forEach(function(movie) {
            if (movie.locations) {
              movie.locations.forEach(function(d) {
                if (d.lat && d.lon) {
                  var point = {
                    lat: parseFloat(d.lat),
                    lng: parseFloat(d.lon)
                  };
                  Map.addMarker(point, markerTemplate({
                    title: movie.title,
                    location: d.name,
                    releaseYear: movie.releaseYear,
                    director: movie.director
                      ? movie.director.name
                      : '',
                    actors: movie.actors
                      ? movie.actors.join(",")
                      : '',
                    productionCompany: movie.productionCompany
                      ? movie.productionCompany
                      : ''
                  }));
                }
              });
            }
          });
        }
      });

    }
  };
});
