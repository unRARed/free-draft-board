var express = require('express');
var app = module.exports = express();
var shared = require('../sharedVars.js');

app.get('/settings', function(req, res){
  res.render('settings', {
    pageTitle: shared.prependTitle("Board Creator")
  }); 
});
