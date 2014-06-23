var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost/freeDraftBoard'); 

var PickSchema = new Schema({
  team: { type: String },
  pick: { type: Number },
  player: { type: String }
});

var BoardSchema = new Schema({
  shortId: { type: String, index: true, required: true },
  league: { type: String },
  password: { type: String },
  rounds: { type: Number, max: 99 }, 
  minutes: { type: Number, max: 60 },
  seconds: { type: Number, max: 60 },
  serpentine: { type: Boolean, default: true },
  teams: [],
  picks: [PickSchema]
});

BoardSchema.pre('save', function(next) {

  var board = this;

  // only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  bcrypt.genSalt(10, function(err, salt) {

    if (err) return next(err);

    console.log(salt);

    bcrypt.hash(board.password, salt, function(err, hash) {
      
      if (err) return next(err);

      board.password = hash;
      next();

    });

  });

});

var models = {
  Board: mongoose.model('Board', BoardSchema),
  Pick: mongoose.model('Pick', PickSchema)
};

module.exports = models;
