var FOURSQUARE_CREDENTIALS = {
  client_id: 'client_id',
  client_secret: 'client_secret'
};
var FLICKR_KEY = 'FLICKR_KEY';
/*
  Adding Locations in South Africa
*/

/* Creating Info Window View Model */
var InfoWindowViewModel = function() {
  this.title = ko.observable('');
  this.wikiLinks = ko.observableArray([]);
  this.wikiErrorMessage = ko.observable('');
  this.photoURL = ko.observable('');
  this.flickrErrorMessage = ko.observable('');
};

/* Creating the Main Map View Model */

var MapViewModel = function() {

  /* Initializing ViewModel Variables */

  self = this;
  self.wikiLinks = ko.observableArray([]);
  self.locationList = ko.observableArray([]);
  self.currentFilter = ko.observable('');
  self.currentName = '';
  self.markers = [];

  /* Pointer to the Firebase repository */

  var dbRefObject = firedb.ref().child('locations');

  /*
    Firebase Event Listener that runs one time for every element in the
    firebase location
  */
  dbRefObject.on('child_added',function(data) {
    // Adding The Firebase Data to the View Model
    self.locationList.push(new Location(data));
    // Creating the Map Marker
    var marker = createMarker(data);
    /*
      Checking for Click Events on the marker
      If the marker is clicked the marker should bounce and open an info Window
      with a Flickr Photo and Wikipedia Links
    */
    marker.addListener('click', function() {
      self.handleOpenMarker(this);
    });

    // Change the marker color based on it's favorite status
    styleMarkerByFavoriteStatus(data.val().favorite,marker);

    // Push the marker into the marker's array
    self.markers.push(marker);
  });
  /*
    Fetch the closest Pizza Stops from the Foursquare and add them to our
    firebase datastore if they do not exist
  */
  $.ajax({
    url: 'https://api.foursquare.com/v2/venues/search',
    data: {
      ll: '-26.204103,28.047305',
      intent: 'checkin',
      radius: 2000,
      query: 'pizza',
      client_id: FOURSQUARE_CREDENTIALS.client_id,
      client_secret: FOURSQUARE_CREDENTIALS.client_secret,
      v: '20170801'
    },
    success: function(resp) {
      // Handle the API response in case of a successful request
      if(resp.response.venues.length) {
        resp.response.venues.forEach(function(venue) {
          var location = {
            name: venue.name,
            location: venue.location,
            favorite: false
          };
          firedb.ref().child('locations').child(venue.name).once("value",function(data) {
            if(!data.val()) {
              data.ref.set(location);
            }
          });
        });
      } else {
        // Send an alert to the screen if no foursquare venues were found
        alert('No Foursquare venues found');
      }
    },
    error: function() {
      //Send an alert to the screen if the foursquare venues cannot be loaded
      alert('Unable to collect foursquare data');
    }
  });

  /*
    This is a helper method to find a marker using it's title
  */
  self.findMarkerByTitle = function(name) {
    var chosenMarker = null;
    self.markers.forEach(function(marker) {
      if(marker.title === name) {
          chosenMarker = marker;
      }
    });
    return chosenMarker;
  };

  /*
    This is a helper method used to `favorite` a location
  */
  self.toggleFavorite = function(object) {
      // Toggle the favorite status
      object.favorite(!object.favorite());
      /*
        Prepare the model object with the changed data
      */
      var obj = {
        favorite: object.favorite(),
        location: object.location(),
        name: object.name()
      };
      /*
        Find the specific marker that was changed
      */
      var marker = self.findMarkerByTitle(object.name());
      /*
        Style the marker based on it's favorite Status
      */
      styleMarkerByFavoriteStatus(object.favorite(),marker);
      firedb.ref().child('locations').child(object.name()).set(obj);
  };
  /*
    This is a helper method set to filter markers based on the user input
    When the user types a location name only that marker should appear
  */
  self.filterMarkers = function() {
    self.markers.forEach(function(marker) {
        //Check if the user input is a substring of the marker's title
        if(marker.title.toLowerCase().indexOf(self.currentFilter().toLowerCase())  === -1) {
          //Remove the marker from the map
          marker.setMap(null);
        } else {
          //Add the marker to the map
          marker.setMap(map);
        }
    });

  };
  /*
    This is a helper method to filter the locations on the sidebar list
    When the user types a location name only that name should appear in the
    sidebar
  */
  self.mapLocations = ko.computed(function() {
    self.filterMarkers();
    if(self.currentFilter() === '') {
      return self.locationList();
    } else {
      return ko.utils.arrayFilter(self.locationList(), function(location) {
          return location.name().toLowerCase().indexOf(self.currentFilter()) != -1;
      });
    }
  });

  /*
    Method to open and animate the selected marker/location
  */
  self.handleOpenMarker = function(marker) {
    //Check if the marker is not selected
    if(self.currentName !== marker.title) {
      // Create a new ViewModel for the Info Window
      var infoWindowVM = new InfoWindowViewModel();
      // Create an observable for the wikipedia links
      self.wikiLinks = ko.observableArray([]);
      // Open the Marker
      openMarker(marker);
      // Get the Info Window HTML Element
      var element = document.getElementById('infowindow');
      // Apply the KNOCKOUTJS bindings to the Infowindow
      ko.applyBindings(infoWindowVM,element);
      // Prepare the Wikipedia URL
      var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch'+
                    '&search='+ marker.title + '&format=json'+
                    '&callback=wikiCallback';
      // Perform the Asynchronous request to collect Wikipedia information
      $.ajax({
              url: wikiUrl,
              dataType: 'jsonp',
              success: function(response) {
                          // Check if articles were found
                          if(response[1].length) {
                            /*
                              Add the Wikipedia Article Information to the
                              Info Window ViewModel
                            */
                            for(var i = 0; i < response[1].length; i++ ) {
                                var data = {
                                    name: response[1][i],
                                    url: response[3][i]
                                };
                                infoWindowVM.wikiLinks.push(new WikiLink(data));
                            }
                          } else {
                            // Show a message when an error occurrs
                            infoWindowVM.wikiErrorMessage('No Wiki Links Found');
                          }
                        },
              error: function() {
                         // Show a message when an error occurrs
                         infoWindowVM.wikiErrorMessage('Unable to show Wikipedia Information');
                     }
       });
       // Prepare the Flickr URL
       var flickrUrl =  "https://api.flickr.com/services/rest/?"+
                        "method=flickr.photos.search"+
                        "&api_key="+FLICKR_KEY+
                        "&text="+marker.title+"&format=json"+
                        "&nojsoncallback=1";
       //Fetch a flickr photo from the Flickr API
       $.ajax({
         url: flickrUrl,
         success: function(response) {
           var count = parseInt(response.photos.total);
           // Check if any Flickr Photos were found
           if(count) {
             var item = response.photos.photo[0];
             var photoURL = 'https://farm' + item.farm +
                            '.static.flickr.com/' + item.server +
                            '/' + item.id + '_' + item.secret + '_m.jpg';
             infoWindowVM.photoURL(photoURL);
           } else {
             // Display an Error Message if a Flickr photo was not found
             infoWindowVM.flickrErrorMessage('No Image Data to Show');
           }
         },
         error: function() {
           /* Display an error message if there was any issue collecting the
              Flickr Photo
           */
           infoWindowVM.flickrErrorMessage('No Image Data to Show');
         }
       });
       // Change the current marker
       self.currentName = marker.title;
     }

  };
  /*
    Helper Function to find and Open a marker after the list is clicked
  */
  self.findAndOpenMarker = function(object) {
    var infoWindowVM = new InfoWindowViewModel();
    self.wikiLinks = ko.observableArray([]);
    for(var i = 0; i < self.markers.length;i++) {
      if(object.name() === self.markers[i].title) {
        self.handleOpenMarker(self.markers[i]);
      }
    }
  };
};

// Location Model Object
var Location = function(data) {
  this.name = ko.observable(data.key);
  this.location = ko.observable(data.val().location);
  this.favorite = ko.observable(data.val().favorite);
};

// Wikipedia Link Model Object
var WikiLink = function(data) {
  this.name = ko.observable(data.name);
  this.url = ko.observable(data.url);
};

// Wait for the Map Object to be Initialized
if(map) {
  ko.applyBindings(new MapViewModel());
} else {
  setTimeout(function() {
    ko.applyBindings(new MapViewModel());
  },2000);
}
