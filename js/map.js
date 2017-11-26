var map;
 // Create a new blank array for all the listing markers.
 var markers = [];
 var largeInfowindow;
 var bounds;
 var defaultIcon;
 var highlightedIcon;
 function initMap() {

   bounds = new google.maps.LatLngBounds();
   largeInfowindow = new google.maps.InfoWindow();
   // Constructor creates a new map - only center and zoom are required.
   map = new google.maps.Map(document.getElementById('map'), {
     center: {lat: -26.204103, lng: 28.047305},
     zoom: 12,
     mapTypeControl: false,
     zoomControl: true,
     zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_CENTER
     },
     fullscreenControl: true,
     fullscreenControlOptions: {
       position: google.maps.ControlPosition.TOP_CENTER
     }
   });

   // Set the Default Map Icons
   defaultIcon = makeMarkerIcon('0091ff');
   highlightedIcon = makeMarkerIcon('FFFF24');
 }

 function populateInfoWindow(marker, infowindow) {

   // Check to make sure the infowindow is not already opened on this marker.
   if (infowindow.marker != marker) {
     // Set the Info Window Content
     infowindow.setContent('<div id="infowindow"><h4 id="info-heading">' + marker.title +
                          '</h4><h4>Wikipedia Links</h4>' +
                          '<p data-bind="text: wikiErrorMessage"></p>' +
                          '<ul class="wikipedia-list" data-bind="foreach: wikiLinks">'+
                          '<li><a target="_blank" data-bind="attr: {href: url},text: name">' +
                          '</a></li></ul>'+
                          '<h4>Flickr Photo</h4>'+
                          '<img src="" data-bind="attr: {src: photoURL}"/>'+
                          '<p data-bind="text: flickrErrorMessage">'+
                          '</div>');
     infowindow.marker = marker;
     // Make sure the marker property is cleared if the infowindow is closed.
     infowindow.addListener('closeclick', function() {
       infowindow.marker = null;
     });
     // Open the Info Window
     infowindow.open(map, marker);
   }
 }
 /* Helper Method to Style a Marker Based on it's favorite status */
 function styleMarkerByFavoriteStatus(favorite, marker) {
   if(!favorite) {
     marker.setIcon(defaultIcon);
   } else {
     marker.setIcon(highlightedIcon);
   }
 }

 /* Open a Marker */
 function openMarker(marker) {
   toggleAnimate(marker);
   populateInfoWindow(marker,largeInfowindow);
 }
/* Toggle an Animation when the marker is selected */
 function toggleAnimate(marker) {
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function() {
            marker.setAnimation(null);
          },2000);
        }
 }
 /* Method to create a new Marker */
 function createMarker(data) {

   var marker = new google.maps.Marker({
     position: data.val().location,
     title: data.key,
     animation: google.maps.Animation.DROP
   });
   bounds.extend(marker.position);
   marker.setMap(map);
   map.fitBounds(bounds);
   return marker;
 }

 // This function takes in a COLOR, and then creates a new marker
 // icon of that color. The icon will be 21 px wide by 34 high, have an origin
 // of 0, 0 and be anchored at 10, 34).
 function makeMarkerIcon(markerColor) {
   var markerImage = new google.maps.MarkerImage(
     'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
     '|40|_|%E2%80%A2',
     new google.maps.Size(21, 34),
     new google.maps.Point(0, 0),
     new google.maps.Point(10, 34),
     new google.maps.Size(21,34));
   return markerImage;
 }
