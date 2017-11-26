# Neighborhood Map Project

This project is a project that is mainly focused on exploring the front end scripting that can be performed with Javascript and also API integration

## Prerequisites

In order to run the application some prerequisites must be met, please find them below

* Get a Flickr [API KEY](https://www.flickr.com/services/api/misc.api_keys.html)

* Obtain Foursquare  [Credentials](https://developer.foursquare.com/docs/api/getting-started)

* Get a Google Maps [API KEY](https://developers.google.com/maps/documentation/javascript/get-api-key)

* Create a Firebase Project and get your Firebase [Credentials](https://firebase.google.com/docs/web/setup)

## Configuration

The Following steps need to be followed in order to configure the application

### Configuring Firebase

* Go to the [Firebase Console](https://console.firebase.google.com/)
* Select your Firebase Project
* Select the option 'Add Firebase to your Web App'
* Copy the config option and replace the config object in the `js/firebase.js` file in the project
* On the Firebase Console go to `Database`
* Create a new Child called `locations` with dummy information
* Click on the newly created `locations` child
* Click on the three vertical dots
* Select Import JSON
* Select the `firedata.json` file in the project root directory
* Replace the information on the `Rules Tab` with the following information:  `{
  "rules": {
    ".read": true,
    ".write": true
  }
}`
* Voila , we now have sample data sitting on our firebase DB

### Configuring Google Maps

* Replace `GOOGLE_MAPS_API_KEY` with your Google Maps API Key on the `index.html` folder

### Configuring Foursquare

* Replace `client_secret` and `client_id` with your Foursquare credentials in the `js/app.js` file 

### Configuring Flickr

* Replace `FLICKR_KEY` with your Flickr API key in the `js/app.js` file

## Running the Application

To run the application simply open the `index.html` file after you have correctly configured the project

## Appreciation Space

I would like to kindly thank:

* [Flickr](https://www.flickr.com/) for the images
* [Wikimedia](https://www.mediawiki.org/wiki/API:Main_page) for additional information on the location
* [Foursquare](https://foursquare.com/) for additional location information
* [Udacity](https://www.udacity.com) For the Knowledge
