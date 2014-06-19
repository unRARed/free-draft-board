$(document).ready(function() {
  
  function init(settings) {

    console.log(settings.minutes);
    console.log(settings.seconds);

    var tileWidth = (100.0 / settings.teams.length);
    console.log(tileWidth)

    var $teams = $(".team");
    var $picks = $(".pick");
    var $tiles = $(".team, .pick");

    if (settings.serpentine) {
      var $evenRounds = $(".round.even");
      $evenRounds.each(function() {
        var evenPicks = $(this).children();
        $(this).append(evenPicks.get().reverse());
      });
    }

    $tiles.each(function(){
      this.style.width = tileWidth + "%";
    });

    // don't square the team names
    $picks.each(function() {
      $(this).height($(this).width());
    });

    $(window).resize(function() {
      var windowWidth = $(this).width();
      var boardWidth = windowWidth;
      var rowWidth = boardWidth * .99;
      var unitWidth = (rowWidth / settings.teams.length) *.98;
      setTimeout(function() {
        $(".board").width(boardWidth);
        $(".league, .round").width(rowWidth);
          $(".pick").height(unitWidth).width(unitWidth);
          $(".team").width(unitWidth);
      }, 100);

    });
  }
  
  init(settings);

});
