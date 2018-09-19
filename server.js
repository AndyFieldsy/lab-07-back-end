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
app.get('/yelp', getRestaurants); // yelp API
app.get('/movies', getMovies); // The Movie Database API

// Tells the server to listen to the PORT, and console.logs to tell us it's on.
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

// HELPER FUNCTIONS BELOW //
// Google helper function refactored prior to lab start.
function getGoogleLocation(request, response) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GOOGLE_API_KEY}`;
  return superagent.get(url)
    .then(result => {

      response.send(new LocationResult(request.query.data, result.body.results[0].formatted_address, result.body.results[0].geometry.location.lat, result.body.results[0].geometry.location.lng));
    })
    .catch(error => processError(error, response));
}

// Contructor function for Google API
function LocationResult(search, formatted, lat, lng) {
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
      weatherData = result.body.daily.data.map((value) => {
        return new WeatherResult(value.time, value.summary)
      })
      response.send(weatherData);
    })
    .catch(error => processError(error, response));
}

// Restraurant helper function
function getRestaurants(request, response) {
  const url = `https://api.yelp.com/v3/businesses/search?location=${request.query.data.search_query}`;

  superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(result => {
      let yelpData = [];
      yelpData = result.body.businesses.map((value) => {
        return new RestaurantResult(value.name, value.image_url, value.price, value.rating, value.url);
      })
      response.send(yelpData);
    })
    .catch(error => processError(error, response));
}

//Movies helper function
function getMovies(request, response) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_APIv3_KEY}&query=${request.query.data.search_query}`
  return superagent.get(url)
    .then(result => {
      let movieData = [];
      // console.log(result.body.title);
      movieData = result.body.results.map(value => {
        return new MovieResults(value.title, value.overview, value.vote_average, value.vote_count, value.poster_path, value.popularity, value.release_date);
      })
      response.send(movieData);
    })
    .catch(error => processError(error, response));
}

// Error handeling function
function processError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}



// CONSTRUCTOR FUNCTIONS

// Constructor function for Darksky API
function WeatherResult(time, forecast) {
  this.time = new Date(time * 1000).toString().slice(0, 15),
    this.forecast = forecast
}

//Constructor function for Yelp API
function RestaurantResult(name, image, price, rating, url) {
  this.name = name,
    this.image_url = image,
    this.price = price,
    this.rating = rating,
    this.url = url
}

//Constructor function for The Movie Database API
//Constructor function for Yelp API
function MovieResults(title, overview, average, total, image, popularity, released) {
  this.title = title,
    this.overview = overview,
    this.average_votes = average,
    this.total_votes = total,
    this.image_url = `https://image.tmdb.org/t/p/w500${image}`,
    this.popularity = popularity,
    this.released_on = released
}
