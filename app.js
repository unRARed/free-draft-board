var express = require('express');
var path = require('path');
var lessMiddleware = require('less-middleware');
var shortId = require('shortid');
var bodyParser = require('body-parser')
var favicons = require('connect-favicons');
var app = express();
var siteTitle = "FreeDraftBoard.com - Free offline drafting for fantasy sports leagues."
var models = require('./db')
var Board = models.Board;
var Pick = models.Pick;

var prependToTitle = function(title) {
  return title + " | " + siteTitle;
}

shortId.seed(461);

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')

app.use(lessMiddleware(path.join(__dirname, 'less'), {
  dest: path.join(__dirname, 'public'),
  preprocess: {
    path: function(pathname, req) {
      return pathname.replace('/css', '/');
    }
  }
}));
app.use(express.static(__dirname + '/public'));
app.use(favicons(__dirname + '/public/img/icons')); 
app.use(bodyParser());

app.get('/', function(req, res){ 
  res.render('index', {pageTitle: siteTitle}); 
});

app.get('/settings', function(req, res){
  res.render('settings', {
    pageTitle: prependToTitle("Board Creator")
  }); 
});

app.post('/board', function(req, res){
  var is_serpentine = (req.body.serpentine === 'on');

  var teamsArray = [];
  var teamsPicksArray = [];

  var confirmedPassword = null;

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

  console.log(confirmedPassword);

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

  board.save(function(err, board) {

    res.redirect('/board/' + board.shortId);

  });

});


app.get('/board/:passedShortId', function(req, res){

  Board.findOne({shortId: req.params.passedShortId}, function(err, settings) {
    if (!settings) {
      res.send(404, '404 Not Found');
    }

    var openPicks = [];

    console.log(settings);

    //find first empty pick and pass that ID
    for (i=0;i<settings.picks.length;i++) {
      if (settings.picks[i].player === undefined) {
        var openPick = {};
        openPick.pick = settings.picks[i].pick;
        openPick.team = settings.picks[i].team;
        openPicks.push(openPick);
      }
      if (settings.picks[i].pick === parseInt(req.body.pick)) {
        settings.picks[i].player = req.body.player;
      }
    }

    openPicks.sort(function(a,b) {
      return a.pick - b.pick;
    });

    console.log(openPicks);

    res.render('board', {
      settings: settings,
      openPicks: openPicks,
      pageTitle: prependToTitle("Live Draft Board")
    });
  });

});


// TODO - Make /board requests show the most recent COMPLETED<-(important) drafts

app.post('/select', function(req, res) {

  Board.findOne({shortId: req.body.shortId}, function(err, settings) {
    if (!settings) {
      res.send(404, '404 Not Found');
    }

    settings.picks.map(function(err, key, val) {
      if (val[key].pick === parseInt(req.body.pick)) {
        val[key].player = req.body.player;
      }
    });

    settings.save();

    console.log(settings);
    res.send(req.body.player);
  });

  console.log(req.body);
});

app.post('/picktime', function(req, res) {
  Board.findOne({shortId: req.body.shortId}, function(err, settings) {
    if (!settings) {
      res.send(404, '404 Not Found');
    }

    settings.pickTime = req.body.picktime;
    settings.save();
  });
});

app.get('/*', function(req, res){
  res.status(404);
  res.send('404 Not Found');
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
