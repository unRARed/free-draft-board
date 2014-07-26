var express = require('express');
var path = require('path');
var lessMiddleware = require('less-middleware');
var sessions = require("client-sessions");
var shortId = require('shortid');
var bodyParser = require('body-parser')
var favicons = require('connect-favicons');
var app = express();

// Defined routes
var routeRoot = require('./routes');
var route404 = require('./routes/404');
var routeBoard = require('./routes/board');
var routeSettings = require('./routes/settings');

shortId.seed(461);

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')

app.use(sessions({
  cookieName: 'clientCookie',
  duration: 24 * 60 * 60 * 1000, // 24 hours
  secret: 'SBuHgjxmhbk9EACEeXPq3Yfd4wsA3Xtwcw8S9fZtJUNXD8eMBjV95Zbr5B5e'
}));

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
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(routeRoot);
app.use(routeSettings);
app.use(routeBoard);

// this should always be last route
// as it is the catch-all
app.use(route404);

// TODO - Make /boards requests show the most recent COMPLETED<-(important) drafts

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
