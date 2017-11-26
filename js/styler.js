/*
  Sidenav Animation Functionality
  This is required for the sidenav to leave the page smoothly
*/
$(function() {
    $('#hamburger-button').on('click', function() {
      $('#sidenav').toggleClass('closed-nav');
      $('#topnav').toggleClass('expanded-element');
      $('#map').toggleClass('expanded-element');
    });
});
