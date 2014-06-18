var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/freeDraftBoard');
var db = mongoose.connection;

var PickSpec = mongoose.Schema({
  pick: { type: Number },
  player: { type: String }
});

var TeamSpec = mongoose.Schema({
  name: { type: String },
  slot: { type: Number },
  picks: [PickSpec]
});

var BoardSpec = mongoose.Schema({
  shortId : { type: String, index: true },
  rounds : { type: Number, max: 99 }, 
  minutes : { type: Number, max: 60 },
  seconds : { type: Number, max: 60 },
  serpentine : { type: Boolean, default: true },
  teams: [TeamSpec]
});

var models = {
  Board: mongoose.model('Board', BoardSpec),
  Team: mongoose.model('Team', TeamSpec),
  Pick: mongoose.model('Pick', PickSpec)
};

module.exports = models;
