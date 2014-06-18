var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/freeDraftBoard');
var db = mongoose.connection;

var boardSchema = mongoose.Schema({
  shortId :  { type: String, index: true },
  rounds   :  { type: Number, max: 99 }, 
  minutes   :  { type: Number, max: 60 },
  seconds : { type: Number, max: 60 },
  serpentine  :  { type: Boolean, default: true },
  teams: []
});

var models = {
  Board: mongoose.model('Board', boardSchema)
};

module.exports = models;
