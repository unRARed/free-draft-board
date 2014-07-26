var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost/freeDraftBoard'); 

var PickSchema = new Schema({
  team: { type: String },
  pick: { type: Number },
  value1: { type: String },
  value2: { type: String },
  meta1: { type: String },
  meta2: { type: String },
  meta3: { type: String }
});

var BoardSchema = new Schema({
  shortId: { type: String, index: true, required: true },
  active: { type: Boolean, default: false }, // if started
  paused: { type: Boolean, default: false },
  complete: { type: Boolean, default: false }, // if all picks have been made and confirmed finished
  league: { type: String },
  password: { type: String },
  rounds: { type: Number, max: 99 }, 
  minutes: { type: Number, max: 60 },
  seconds: { type: Number, max: 60 },
  serpentine: { type: Boolean, default: true },
  timeStarted: { type: Number, default: null },
  timeRemaining: { type: Number, default: null },
  currentPick: { type: Number, default: 1 },
  teams: [],
  picks: [PickSchema],
  poolType: { type: String },
  pool: []
});

BoardSchema.methods.openPicks = (function () {
  var openPicks = [];

  //find first empty pick and pass that ID
  for (i=0;i<this.picks.length;i++) {
    if (this.picks[i].value1 === undefined) {
      openPicks.push(this.picks[i].pick);
    }
  }

  openPicks.sort(function(a,b) {
    return a - b;
  });

  return openPicks;
});

BoardSchema.methods.roundTimeInMs = (function () {
  return ((this.minutes * 60) + this.seconds) * 1000;
});

BoardSchema.methods.resetTimeRemaining = (function () {
  this.timeRemaining = this.roundTimeInMs();
});

BoardSchema.methods.updateTimeRemaining = (function (clientTimeStamp) {
  var timePassed = (clientTimeStamp - this.timeStarted);
  this.timeRemaining = this.roundTimeInMs() - timePassed;
});

// returns true if given password's hash 
// is equal to the hash stored
BoardSchema.methods.isHashPasswordHash = (function (password) {
  if (password && this.password) {
    return bcrypt.compareSync(password, this.password);
  } else {
    return false; // false if either password value is NULL
  }
});

BoardSchema.pre('save', function(next) {

  // only hash the password if it has been set... or new or modified.
  if (!this.isModified('password') || !this.password) return next();

  var board = this;

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
