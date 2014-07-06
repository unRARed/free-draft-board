var express = require('express');
var app = module.exports = express();
var shared = require('../sharedVars.js');

app.get('/*', function(req, res){
  res.status(404);
  res.send('404 Not Found');
});
