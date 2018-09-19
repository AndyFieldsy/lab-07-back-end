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


// Tells the server to listen to the PORT, and console.logs to tell us it's on.
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

// HELPER FUNCTIONS BELOW //
// Google helper function refactored prior to lab start.
function getGoogleLocation(request, response) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GOOGLE_API_KEY}`;
  return superagent.get(url)
    .then(result => {
      const locationResult = {
        search_query: request.query.data,
        formatted_query: result.body.results[0].formatted_address,
        latitude: result.body.results[0].geometry.location.lat,
        longitude: result.body.results[0].geometry.location.lng
      }
      response.send(locationResult);
    })
    .catch(error => console.log(`error message: ${error}`));
}
