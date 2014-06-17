var express = require('express');
var path = require('path');
var lessMiddleware = require('less-middleware');
var shortId = require('shortid');
var bodyParser = require('body-parser')
var app = express();
var siteTitle = "FreeDraftBoard.com - Free offline drafting for fantasy sports leagues."
var Board = require('./db')

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

  var board = new Board({
    shortId: req.body.shortId,
    rounds: req.body.rounds,
    minutes: parseInt(req.body.minutes),
    seconds: parseInt(req.body.seconds),
    serpentine: is_serpentine,
    teams: req.body.team_names 
  });

  board.save();


  res.redirect('/board/' + req.body.shortId);

});


app.get('/board/:passedShortId', function(req, res){

  Board.findOne({shortId: req.params.passedShortId}, function(err, settings) {
    res.render('board', {
      settings: settings,
      pageTitle: prependToTitle("Live Draft Board")
    });
  });

});

// app.get('/*', function(req, res){
//   res.status(404);
//   res.send('404 Not Found');
// });

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
