const express = require('express');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const request = require('request');
const fs = require('fs');

const client_id = 'be4a0c9519ab4f018d06473169725d2f';
const client_secret = '44b1b05f56744523a3998faceb2a8f23';
const redirect_uri = 'http://localhost:8888/callback';
const authorizeURL = 'https://accounts.spotify.com/authorize?client_id=be4a0c9519ab4f018d06473169725d2f&response_type=code&redirect_uri=http://localhost:8888/callback&scope=playlist-modify-public&state=some-state';

const app = express();
const port = 8888;

var auth_code = null;
var test_num = 2;

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

app.use(express.static(__dirname + '/public'))
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'playlist-modify-public';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/test', function(req, res) {
  test_str = Math.random();
  res.send("abv");
});

app.get('/callback', function(req, res) {
  auth_code = req.query.code || auth_code;
  res.send(auth_code);
});

console.log('Listening on ' + port);
app.listen(port);
