var express = require('express');
var path = require('path');
var lessMiddleware = require('less-middleware');
var app = express();

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
  res.render('layout');
});

app.get('/board', function(req, res){
  res.render('board');
});

app.get('/*', function(req, res){
  res.send('404 Not Found');
});

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});
