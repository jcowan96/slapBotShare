const request = require('request');
const telegram = require('node-telegram-bot-api');
const Spotify = require('spotify-web-api-node');
// const {google} = require('googleapis');
const fs = require('fs');
const readline = require('readline');

//File data
const TOKEN_FILE = 'data/tokens';
const REFRESH_TOKEN = 'AQCbczDxRePuNQW7sMW72IqmV0V90KP73yEaxVS6aPvEjCe6U0LSB0bsfedLPs2W4-7Mgny0StV1LfZpOTYxS5u9fp5Ssa5-cegkuGPEASSpIjAteyjdM-chJkQ8Gl9Ts6MjTg';
const SPOTIFY_PARAMS_FILE = 'private/SpotifyData';
const TELEGRAM_PARAMS_FILE = 'private/TelegramData';
const YOUTUBE_PARAMS_FILE = 'private/YoutubeData';

//Telegram API Data
var TELEGRAM_TOKEN;
var TELEGRAM_TEST_CHAT;

//Spotify API Data
var SPOTIFY_ID;
var SPOTIFY_SECRET;
var REDIRECT_URI;
var SLAP_CHAT_USER;
var SLAP_CHAT_PLAYLIST;
var SPOTIFY_ACCESS_CODE;

//==============================================================================
//Actual code below
//==============================================================================

//Grab API information from files
readTelegramParamsSync();
readSpotifyParamsSync();

//Initialize bot and Spotify registration
const bot = new telegram(TELEGRAM_TOKEN, {polling: true});
const spotify = new Spotify({
  clientId: SPOTIFY_ID,
  clientSecret: SPOTIFY_SECRET,
  redirectUri: REDIRECT_URI
});

//Get auth token for spotify api to work => make sure server.js is running on localhost:8888
var authorizeURL = spotify.createAuthorizeURL(['playlist-modify-public'], 'spotify_auth_state');
var host = 'https://accounts.spotify.com';
var path = authorizeURL.match(/https:\/\/accounts\.spotify\.com(.+)/)[1];
var options = {
  host: host,
  path: path
};
console.log(authorizeURL);

var tokens = readTokensFromFile();

// request(authorizeURL, function(err, response, body) {
//   console.error("error: ", err);
//   console.log("statusCode: ", response.statusCode);
//   console.log("body: ", body);
// });

// spotify.authorizationCodeGrant(SPOTIFY_ACCESS_CODE).then(
//   function(data) {
//     console.log('token expires in ' + data.body['expires_in']);
//     console.log('access token is ' + data.body['access_token']);
//     console.log('refresh token is ' + data.body['refresh_token']);
//
//     var access = data.body['access_token'];
//     var refresh = data.body['refresh_token'];
//     spotify.setAccessToken(access);
//     spotify.setRefreshToken(refresh);
//
//     //Write tokens to file
//     writeTokensToFile(access, refresh);
//   },
//   function(err) {
//     console.log('auth code grant error:', err);
//   }
// );


//==============================================================================
//File and token helpers
//==============================================================================
//Call this when you need to refresh your access token
function refreshToken() {
  console.log("refreshing token");
  spotify.refreshAccessToken().then(
    function(data) {
      console.log("Access token refreshed!");
      var access = data.body['access_token'];
      var refresh = data.body['refresh-token'];

      spotify.setAccessToken(access);
      if (typeof refresh !== 'undefined' && refresh != null) {
        spotify.setRefreshToken(refresh);
      }
      else {
        refresh = REFRESH_TOKEN;
      }
      //Write tokens to file
      writeTokensToFile(access, refresh);
    },
    function(err) {
      console.log('Could not refresh access token', err);
    }
  ).catch(err => {
    console.error("refresh error:", err);
  });
}

//Write access and refresh tokens to file to reference later
function writeTokensToFile(access, refresh) {
  fs.writeFileSync(TOKEN_FILE, access + "\n", function(err) {
    if (err) {
      return console.log(err);
    }
  });
  fs.appendFileSync(TOKEN_FILE, refresh + "\n", function(err) {
    if (err) {
      return console.log(err);
    }
  });
}

//Read token data in from file, return as array
function readTokensFromFile() {
  const readInterface = readline.createInterface({
    input: fs.createReadStream(TOKEN_FILE),
    console: false
  });

  var tokens = [];
  readInterface.on('line', function(line) {
    tokens.push(line);
  });
  readInterface.on('close', () => {
    spotify.setAccessToken(tokens[0]);
    spotify.setRefreshToken(tokens[1]);
    return tokens;
  });

  //Sync read
  // var lines = fs.readFileSync(TOKEN_FILE, 'utf-8').split('\n');
  // console.log('tokens:');
  // console.log(lines);
  // return lines;
}

//Read in telegram parameters from file syncronously
function readTelegramParamsSync() {
  //Regex to grab parameter data from file
  const token = /TELEGRAM_TOKEN: (.+)/;
  const test_chat = /TELEGRAM_TEST_CHAT: (.+)/;
  const slap_chat = /TELEGRAM_SLAP_CHAT: (.+)/;

  var contents = fs.readFileSync(TELEGRAM_PARAMS_FILE, 'utf8');

  //Match each regex to their specified parameter
  var token_match = contents.match(token);
  var test_match = contents.match(test_chat);
  var slap_match = contents.match(slap_chat);

  //Print
  console.log(token_match[1]);
  console.log(test_match[1]);
  console.log(slap_match[1]);

  //Assign each matched parameter to global variable
  TELEGRAM_TOKEN = token_match[1];
  TELEGRAM_TEST_CHAT = test_match[1];
  TELEGRAM_SLAP_CHAT = slap_match[1];
}

//Read in spotify parameters from file syncronously
function readSpotifyParamsSync() {
  //Regex to grab parameter data from file
  const id = /SPOTIFY_ID: (.+)/;
  const secret = /SPOTIFY_SECRET: (.+)/;
  const uri = /REDIRECT_URI: (.+)/;
  const user = /SLAP_CHAT_USER: (.+)/;
  const playlist = /SLAP_CHAT_PLAYLIST: (.+)/;
  const access_code = /SPOTIFY_ACCESS_CODE: (.+)/;

  var contents = fs.readFileSync(SPOTIFY_PARAMS_FILE, 'utf8');

  //Match each regex to their specified parameter
  var id_match = contents.match(id);
  var secret_match = contents.match(secret);
  var uri_match = contents.match(uri);
  var user_match = contents.match(user);
  var playlist_match = contents.match(playlist);
  var access_match = contents.match(access_code);

  //Print
  console.log(id_match[1]);
  console.log(secret_match[1]);
  console.log(uri_match[1]);
  console.log(user_match[1]);
  console.log(playlist_match[1]);
  console.log(access_match[1]);

  //Assign each matched parameter to global variable
  SPOTIFY_ID = id_match[1];
  SPOTIFY_SECRET = secret_match[1];
  REDIRECT_URI = uri_match[1];
  SLAP_CHAT_USER = user_match[1];
  SLAP_CHAT_PLAYLIST = playlist_match[1];
  SPOTIFY_ACCESS_CODE = access_match[1];
}

//==============================================================================
//Telegram bot response routines
//==============================================================================
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  let helpString = "slapBot can handle the following commands: \n";
  helpString += "/echo <string>: echoes what you say back into the chat\n";
  helpString += "/spotify: provides link to spotify playlist\n";
  helpString += "spotify link: adds track to spotify playlist\n";

  bot.sendMessage(chatId, helpString);
});
//Echoes message
bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, match[1]);
});

//Provide link to spotify playlist
bot.onText(/\/spotify/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'https://open.spotify.com/user/1223824978/playlist/5e37cvW49BVwSKGhPHTKGm');
});

//Listens for Spotify links posted in chat
bot.on('message', (msg) => {
  console.log(msg);
    //Get the ID of telegram chat box exists in
    const chatId = msg.chat.id;
    //Regex to match links to various platforms
    const spotify_link = /https:\/\/open.spotify.com\/track\/(.+)\?(.+)/;
    const youtube_link = /https:\/\/youtu.be\/(.+)/;

    //Booleans to tell if a match exists in the message
    var spotifyMatch = msg.text.match(spotify_link);
    var youtubeMatch = msg.text.match(youtube_link);

    //Get spotify playlist, and add track to it
    if (spotifyMatch) {
      handleSpotifyTrack(msg, spotifyMatch);
    }
    else if (youtubeMatch) {
      handleYoutubeTrack(msg, youtubeMatch);
    }
    else {
      handleDefaultMessage(msg);
    }
});

bot.onText(/\/test/, (msg) => {
  const chatId = msg.chat.id;
  spotify.setAccessToken('abcdefg');
  writeTokensToFile(spotify.getAccessToken(), spotify.getRefreshToken());
  console.log('test triggered');
});

//==============================================================================
//Bot helpers
//==============================================================================

//Handle Spotify API to add track to playlist
function handleSpotifyTrack(msg, spotifyMatch) {
  console.log("Spotify Match: " + spotifyMatch);
  let trackId = spotifyMatch[1];
  let trackToAdd = "spotify:track:"+trackId;
  let alreadyIn = false;

  //Check if track already in playlist
  spotify.getPlaylist(SLAP_CHAT_USER, SLAP_CHAT_PLAYLIST)
    .then(function(data) {
      console.log(data.body.tracks.items);
      let items = data.body.tracks.items;
      for (var i = 0; i < items.length; i++) {
        //console.log("Track Id: " + items[i].track.id);
        if (items[i].track.id == trackId) {
          alreadyIn = true;
        }
      }

      //If song is new to playlist, add it
      if (!alreadyIn) {
        spotify.addTracksToPlaylist(SLAP_CHAT_USER, SLAP_CHAT_PLAYLIST, ["spotify:track:"+trackId])
          .then(function(data) {
            console.log("Added track " + trackId + " to playlist");
            bot.sendMessage(TELEGRAM_TEST_CHAT, "Added track " + trackId + " to Spotify playlist"); //Test chat
          }).catch(function(err) {
            console.error("add track error:", err);
            handleSpotifyError(err, spotifyMatch);
          });
      } else {
        console.log("Track " + trackId + " is already in playlist");
        bot.sendMessage(TELEGRAM_TEST_CHAT, "Track " + trackId + " is already in Spotify playlist"); //Test chat
        handleRepost(msg);
      }
    }).catch(function(err) {
      console.error("get playlist error:", err);
      handleSpotifyError(err, spotifyMatch);
    });
}

//Handle Youtube API to add track to playlist
function handleYoutubeTrack(msg, youtubeMatch) {
  console.log(youtubeMatch);
}

function handleSpotifyError(err, spotifyMatch) {
  //Unauthorized error, try resetting access token
  if (err.statusCode == 401) {
    console.error('Unauthorized error, try resetting access token');
    refreshToken();
    readTokensFromFile();
    handleSpotifyTrack(spotifyMatch);
  }
}

function handleDefaultMessage(msg) {
  bot.sendMessage(TELEGRAM_TEST_CHAT, "From: " + msg.from.first_name + " " + msg.from.last_name + " To: " + msg.chat.title + " --- " + msg.text);
  console.log(msg);
}

function handleRepost(msg) {
  let chatId = msg.chat.id;
  let user = msg.from;

  console.log(msg);
  console.log(user);
  bot.sendMessage(TELEGRAM_SLAP_CHAT, "You reposted in the wrong neighborhood, " + user.first_name);
  bot.kickChatMember(chatId, user.id);
}
