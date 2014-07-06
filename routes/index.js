var express = require('express');
var app = module.exports = express();
var shared = require('./sharedVars.js');

app.get('/', function(req, res){ 
  res.render('index', {pageTitle: shared.siteTitle}); 
});
