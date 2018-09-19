'use strict'
// These variables create the connection to the dependencies.
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const app = express();

// Tells express to use 'cors' for cross-origin resource sharing
app.use(cors());

// Allows us to use the .env file
require('dotenv').config();

// assigns the PORT variable to equal the port declared in the .env file for our local server.  It also allows heroku to assign it's own port number.
const PORT = process.env.PORT;

// The following app.get() will call the correct helper function to retrieve the API information.
app.get('/location', getGoogleLocation); //google API
app.get('/weather', getWeather); //darkskies API

// Tells the server to listen to the PORT, and console.logs to tell us it's on.
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

// HELPER FUNCTIONS BELOW //
// Google helper function refactored prior to lab start.
function getGoogleLocation(request, response) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GOOGLE_API_KEY}`;
  return superagent.get(url)
    .then(result => {

      response.send(new LocationResult(request.query.data,result.body.results[0].formatted_address,result.body.results[0].geometry.location.lat,result.body.results[0].geometry.location.lng));
    })
    .catch(error => console.log(`error message: ${error}`));
}

// Contructor function for Google API
function LocationResult(search, formatted, lat, lng){
  this.search_query = search,
  this.formatted_query = formatted,
  this.latitude = lat,
  this.longitude = lng
}

// Weather helper function
function getWeather(request, response) {
  const url = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;
  return superagent.get(url)
    .then(result => {
      let weatherData = [];
      weatherData = result.body.daily.data.map((value)=>{
        console.log(value.time)
        console.log(value.summary)


        return new WeatherResult(value.time,value.summary)
      })
      console.log(weatherData);
      response.send(weatherData);
    })
    .catch(error => console.log(`error message: ${error}`))
}

// Constructor function for Darksky API
function WeatherResult(time, forecast){

  this.time = new Date(time * 1000).toString().slice(0,15),
  this.forecast = forecast
  console.log('time',this.time)
  console.log('forcast',this.forecast)

}

