var express = require('express');
var path = require('path');
var lessMiddleware = require('less-middleware');
var shortId = require('shortid');
var bodyParser = require('body-parser')
var app = express();
var siteTitle = "FreeDraftBoard.com - Free offline drafting for fantasy sports leagues."
var models = require('./db')

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
app.use(bodyParser());

app.get('/', function(req, res){ 
  res.render('index', {pageTitle: siteTitle}); 
});

app.get('/settings', function(req, res){
  res.render('settings', {
    shortId: shortId.generate(),
    pageTitle: prependToTitle("Board Creator")
  }); 
});

app.post('/board', function(req, res){
  var is_serpentine = (req.body.serpentine === 'on');

  // creates Teams object
  var teamsObject = [];

  for (i=0;i<req.body.team_names.length;i++) {
    var team = new models.Team({
      name: req.body.team_names[i],
      slot: (i + 1)
    });
    teamsObject.push(team);
  }

  var board = new models.Board({
    shortId: req.body.shortId,
    rounds: req.body.rounds,
    minutes: parseInt(req.body.minutes),
    seconds: parseInt(req.body.seconds),
    serpentine: is_serpentine,
    teams: teamsObject
  });

  board.save();

  res.redirect('/board/' + req.body.shortId);

});


app.get('/board/:passedShortId', function(req, res){

  models.Board.findOne({shortId: req.params.passedShortId}, function(err, settings) {
    if (!settings) {
      res.send(404, '404 Not Found');
    }
    res.render('board', {
      settings: settings,
      pageTitle: prependToTitle("Live Draft Board")
    });
  });

});

app.post('/select', function(req, res) {

  models.Board.findOne({shortId: req.body.shortId}, function(err, settings) {
      if (!settings) {
        res.send(404, '404 Not Found');
      }

      for (i=0;i<settings.teams.length;i++) {
        if (settings.teams[i].name === req.body.teamName) {
          var pick = new models.Pick({
            pick: parseInt(req.body.pick),
            player: req.body.player
          });
          settings.teams[i].picks.push(pick);
        }
      }

      settings.save()

      console.log(settings);
      res.send(settings);
    });

  console.log(req.body);
});

app.get('/*', function(req, res){
  res.status(404);
  res.send('404 Not Found');
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
