var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/freeDraftBoard');
var db = mongoose.connection;

var PickSpec = mongoose.Schema({
  team: { type: String },
  pick: { type: Number },
  player: { type: String }
});

var BoardSpec = mongoose.Schema({
  shortId : { type: String, index: true },
  league : { type: String },
  rounds : { type: Number, max: 99 }, 
  minutes : { type: Number, max: 60 },
  seconds : { type: Number, max: 60 },
  serpentine : { type: Boolean, default: true },
  teams: [],
  picks: [PickSpec]
});

var models = {
  Board: mongoose.model('Board', BoardSpec),
  Pick: mongoose.model('Pick', PickSpec)
};

module.exports = models;
