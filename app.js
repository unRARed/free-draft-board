var express = require('express');
var path = require('path');
var lessMiddleware = require('less-middleware');
var shortId = require('shortid');
var app = express();

var siteTitle = "FreeDraftBoard.com - Free offline drafting for fantasy sports leagues."

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
      return pathname.replace('/css', '');
    }
  }
}));
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){ 
  res.render('index', {pageTitle: siteTitle}); 
});

app.get('/new', function(req, res){
  console.log(req);
  res.render('new', {
    url_id: shortId.generate(),
    pageTitle: prependToTitle("Board Creator")
  }); 
});

app.get('/board', function(req, res){ 
  res.render('board', {pageTitle: prependToTitle("Live Draft Board")});
});

app.get('/*', function(req, res){
  res.status(404);
  res.send('404 Not Found');
});

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});
