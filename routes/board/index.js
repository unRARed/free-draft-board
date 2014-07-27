var express = require('express');
var app = module.exports = express();
var shortId = require('shortid');
var fs = require('fs');
var models = require('../../db')
var Board = models.Board;
var Pick = models.Pick;
var shared = require('../sharedVars.js');

//////////////////////////////////
//      MAIN LANDING ROUTE      //
//  loads the board passing     //
//  admin if cookie is set.     //
//////////////////////////////////
app.get('/board/:passedShortId', function(req, res){

  var isAuthorized = false;

  Board.findOne({shortId: req.params.passedShortId}, function(err, settings) {
    if (!settings) {
      res.send(404, '404 Not Found');
    }

    // if a cookie is set, check if cookie's 
    // auth value matches the stored password
    if (req.clientCookie) {
      if (settings.isHashPasswordHash(req.clientCookie.auth)) {
        isAuthorized = true;
      }
    }

    res.render('board', {
      settings: settings,
      admin: isAuthorized,
      pageTitle: shared.prependTitle("Live Draft Board"),
    });

  });

});

//////////////////////////////////
//          ADMIN LOGIN         //
//  Sets a cookie to supplied   //
//  password value.             //
//////////////////////////////////
app.post('/board/:passedShortId', function(req, res){

  Board.findOne({shortId: req.params.passedShortId}, function(err, settings) {
    if (!settings) {
      res.send(404, '404 Not Found');
    }

    console.log(req.body);

    // consider saving hash to cookie instead of 
    // actual password value???
    req.clientCookie.auth = req.body['admin-password'];

    res.redirect('/board/' + settings.shortId);    

  });

});

//////////////////////////////////
//  RENDER BOARD FROM /SETTINGS //
//  Creates a mongo store for   //
//  a board with the values it  //
//  receives from the /settings //
//  form input options.         //
//////////////////////////////////
app.post('/board', function(req, res){

  var is_serpentine = (req.body.serpentine === 'on');
  var teamsArray = [];
  var teamsPicksArray = [];
  var confirmedPassword = null;
  var poolType;

  if (req.body.password_value === req.body.pass_confirm_value) {
    confirmedPassword = req.body.password_value;
  } else if (req.body.password_value) {
    // handle when is set but not matching (should also be checked client-side)
    // probably respond with json???
    return res.send(400, 'Bad Request: Password value did not match password confirmation value.');
  }

  for (i=1;i<(req.body.team_names.length+1);i++) {

    var teamName = req.body.team_names[i-1];
    var pickValue;
    teamsArray.push(teamName);

    for(j=0;j<req.body.rounds;j++) {

      if ((j+1)%2==0 && is_serpentine) { // even rounds reverse if serpentine chosen

        pickValue = (req.body.team_names.length)-(i-1) + (req.body.team_names.length * j);

      } else {

        pickValue = i + (req.body.team_names.length * j);

      }

      var pick = new Pick({
        team: teamName,
        pick: pickValue
      });

      teamsPicksArray.push(pick);

    }

  }      

  var board = new Board({
    shortId: shortId.generate(),
    league: req.body.league,
    password: confirmedPassword,
    rounds: req.body.rounds,
    minutes: parseInt(req.body.minutes),
    seconds: parseInt(req.body.seconds),
    serpentine: is_serpentine,
    teams: teamsArray,
    picks: teamsPicksArray
  });

  if (req.body.pool_setting === 'football') {
    fs.readFile(__dirname + '/json/americanFootballBase.json', function (err, data) {
      if (err) throw err;
      var footballJson = JSON.parse(data);

      var players = [];
      var idCounter = 0;

      for (i=0;i<footballJson.length;i++) {
        var team = footballJson[i].city + " " + footballJson[i].name;
        var bye = footballJson[i].bye;

        for (j=0;j<footballJson[i].players.length;j++) {
          var player = {};
          player.firstName = footballJson[i].players[j].firstName;
          player.lastName = footballJson[i].players[j].lastName;
          player.team = team;
          player.position = footballJson[i].players[j].position;
          player.bye = bye;
          player.id = idCounter + "_" + footballJson[i].name + "_" + footballJson[i].players[j].lastName;
          players.push(player);
          idCounter++;
        }

      }

      board.pool = players;
      board.poolType = 'football';

      board.save(function(err, board) {

        res.redirect('/board/' + board.shortId);

      });

    });
  } else { // not loading any pool-data

    board.save(function(err, board) {

      res.redirect('/board/' + board.shortId);

    });

  }

});

//////////////////////////////////
//      SETS BOARD ACTIVE       //
//  If 'start' is clicked from  //
//  admin sub-view, board is    //
//  set to 'active'.            //
//////////////////////////////////
app.post('/board/:passedShortId/active', function(req, res){

  var isAuthorized = false;

  Board.findOne({shortId: req.params.passedShortId}, function(err, settings) {
    if (!settings) {
      res.send(404, '404 Not Found');
    }

    if (req.clientCookie) {
      if (settings.isHashPasswordHash(req.clientCookie.auth)) {
        isAuthorized = true;
      }
    }
    console.log('got into active post')
    if (isAuthorized) {
      console.log('was authorized')
      settings.active = true;
      settings.save();
    }

    res.send({
      active: settings.active
    });

  });

});


////////////////////////////////////////////////////////////
//      APPENDS SUBMITTED DATA TO PICK ID FOR BOARD       //
//  Stores serialized form data to the pick at the index  //
//  req.body.pick and responds with values for display.   //
////////////////////////////////////////////////////////////
app.post('/select', function(req, res) {

  var cleanRequest = {};

  console.log(req.body);

  cleanRequest.shortId = req.body.shortId;
  cleanRequest.pick = parseInt(req.body.pick);

  if (req.body['selection-value1'] !== "") {
    cleanRequest.value1 = req.body['selection-value1'];

    if (req.body['selection-value2'] !== "") {
      cleanRequest.value2 = req.body['selection-value2'];
    }

  } else {
    cleanRequest.value1 = req.body['displayed-value'];
  }
  cleanRequest.id = req.body.selectionId || null;

  if (req.body.selection_meta1 !== "") { cleanRequest.meta1 = req.body.selection_meta1; }
  if (req.body.selection_meta2 !== "") { cleanRequest.meta2 = req.body.selection_meta2; }

  Board.findOne({shortId: cleanRequest.shortId}, function(err, settings) {
    if (!settings) {
      res.send(404, '404 Not Found');
    }

    for (i=0;i<settings.picks.length;i++) {
      if (settings.picks[i].pick === cleanRequest.pick) {
        settings.picks[i].value1 = cleanRequest.value1;

        if (cleanRequest.value2) {
          settings.picks[i].value2 = cleanRequest.value2;
        }
        settings.picks[i].meta1 = cleanRequest.meta1;
        settings.picks[i].meta2 = cleanRequest.meta2;

      }
    }

    // remove selection from server-side data-pool 
    if (cleanRequest.id) {

      settings.pool = settings.pool.filter(function (selection) {
        return selection.id !== cleanRequest.id;
      });

    }

    if (settings.poolType === 'football') {
      cleanRequest.meta2 = "Bye: " + cleanRequest.meta2;
    }

    settings.save();

    res.send(cleanRequest);
  });

});

//////////////////////////////////
//  RESETS PER-PICK STATE DATA  //
//  Sets timeStarted to clients //
//  current time. Also sets the //
//  currently selected pick id  //
//  and resets timeRemaining.  //
//////////////////////////////////
app.post('/newPick', function(req, res) {
  console.log(req.body);
  Board.findOne({shortId: req.body.shortId}, function(err, settings) {
    if (!settings) {
      res.send(404, '404 Not Found');
    }

    settings.timeStarted = req.body.timeStarted;
    settings.resetTimeRemaining();
    settings.currentPick = req.body.currentPick;
    settings.save();

    res.send({
      pickId: settings.currentPick
    });

  });
});

//////////////////////////////////
//  UPDATES PICK TIME REMAINING //
//  Updates time remaining by   //
//  calculating time that has   //
//  passed using timeStarted    //
//  value and passed timeStamp. //
//////////////////////////////////
app.post('/updateTimeRemaining', function(req, res) {
  console.log(req.body);
  Board.findOne({shortId: req.body.shortId}, function(err, settings) {
    if (!settings) {
      res.send(404, '404 Not Found');
    }

    settings.updateTimeRemaining(req.body.clientTime);
    settings.save();
    console.log('settings.timeRemaining is ' + settings.timeRemaining);
    res.send({
      timeRemaining: settings.timeRemaining
    });
  });
});

//////////////////////////////////
//      TOGGLES PAUSED          //
//  When 'paused' or 'resumed'  //
//  from admin sub-view, sets   //
//  to opposite of current val. //
//////////////////////////////////
app.post('/toggleTime', function(req, res) {

  Board.findOne({shortId: req.body.shortId}, function(err, settings) {
    if (!settings) {
      res.send(404, '404 Not Found');
    }

    if (settings.paused) {
      settings.paused = false;
    } else {
      settings.paused = true;
    }
    settings.save();

    res.send({
      isPaused: settings.paused
    });
  });
});


//////////////////////////////////
//    RETRIEVES CURRENT STATE   //
//  For getting the state of    //
//  the board to keep multiple  //
//  clients in sync.            //
//////////////////////////////////
app.get('/state', function (req, res) {
  Board.findOne({shortId: req.query.shortId}, function(err, settings) {
    var state = {};

    state.currentPick = settings.currentPick;
    state.timeRemaining = settings.timeRemaining;
    state.timeStarted = settings.timeStarted;
    state.openPicks = settings.openPicks();
    state.picks = settings.picks;
    state.paused = settings.paused;
    state.completed = settings.completed;
    state.active = settings.active;

    res.send(state);

  });
});


//////////////////////////////////
//     MARKS DRAFT COMPLETE     //
//  Once there are zero open    //
//  picks remaining for board,  //
//  a form instructs user to    //
//  confirm completed. If so,   //
//  this sets board.completed.  //
//////////////////////////////////
app.post('/board/:passedShortId/complete', function(req, res){

  var isAuthorized = false;

  Board.findOne({shortId: req.params.passedShortId}, function(err, settings) {
    if (!settings) {
      res.send(404, '404 Not Found');
    }

    if (req.clientCookie) {
      if (settings.isHashPasswordHash(req.clientCookie.auth)) {
        isAuthorized = true;
      }
    }

    if (isAuthorized) {
      settings.completed = true;
      settings.save();
    }

    res.redirect('/board/' + settings.shortId);

  });

});
