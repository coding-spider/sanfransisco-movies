$(document).ready(function() {

  var Map = (function() {
    var mapModule = {};
    var markers = [];

    var infoWindow = new google.maps.InfoWindow();

    var map = new google.maps.Map(document.getElementById('map'), {
      center: {
        lat: 37.773972,
        lng: -122.431297
      },
      zoom: 14
    });

    var addInfoWindow = function(marker, data) {
      marker.addListener('click', function() {
        infoWindow.setContent(data);
        infoWindow.open(map, marker);
      });
    };

    mapModule.addMarker = function(location, data) {
      var marker = new google.maps.Marker({position: location, map: map});
      markers.push(marker);
      addInfoWindow(marker, data);
    };

    mapModule.clearMarkers = function() {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
      }
      markers = [];
    };
    return mapModule;
  }());

  // UNderscore settings
  var setUnderscoreDefaultSettings = function() {
    _.templateSettings = {
      interpolate: /\{\{(.+?)\}\}/g, // print value: {{ value_name }}
      evaluate: /\{%([\s\S]+?)%\}/g, // excute code: {% code_to_execute %}
      escape: /\{%-([\s\S]+?)%\}/g // excape HTML: {%- <script> %} prints &lt;script&gt;
    };
  }
  setUnderscoreDefaultSettings();

  //Load template
  var markerTemplate = _.template($("#markerDom").html());

  /** Autocomplete **/
  $("#searchInp").autocomplete({
    delay: 300,
    minLength: 3,
    source: function(request, response) {
      $.getJSON('/api/searches/autocomplete', {
        q: request.term,
        type: 'movie'
      }, function(data, status, xhr) {
        var formattedResults = data.map(function(m) {
          m.value = m.title;
          return m;
        });
        response(formattedResults);
      });
    },
    select: function(event, ui) {
      Map.clearMarkers();
      getLocations('movie', ui.item);
    }
  });

  $("#searchBtn").click(function() {
    var text = $("#searchInp").val();
    if (!text.trim()) {
      return;
    }
    Map.clearMarkers();
    getLocations('movie', null, text.trim());
  });

  function getLocations(type, movie, q) {
    if (movie) {
      //No exact match
      $.getJSON('api/movies/' + movie.id, {
        filter: {
          include: ['locations']
        }
      }, function(data) {
        if (!data) {
          $(".no-results").css('visibility', 'visible');
        } else {
          $(".no-results").css('visibility', 'hidden');
          bindMarkerLocation(data);
        }
      });
    } else {
      //Exact match
      $.getJSON('/api/searches/exactmatch', {
        q: q,
        type: type
      }, function(data) {
        if (!data.length) {
          $(".no-results").css('visibility', 'visible');
        } else {
          $(".no-results").css('visibility', 'hidden');
          data.forEach(function(movie) {
            if (movie.locations) {
              bindMarkerLocation(movie);
            }
          });
        }
      });

    }
  };

  function bindMarkerLocation(movie) {
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
