$(document).ready(function() {

  function scaleBoard(boardWidth) {
    while (boardWidth % settings.teams.length !== 0) { boardWidth--; }
    var unitWidth = (boardWidth / settings.teams.length);
    var pixelFraction = 1 / settings.teams.length;
    setTimeout(function() {
      $(".league, .round").css({width: boardWidth + "px"});
      $(".pick").css({width: (unitWidth - pixelFraction) + "px", height: (unitWidth - pixelFraction) + "px"});
      $(".team").css({width: (unitWidth - pixelFraction) + "px"});
    }, 100);
  }
  
  function init(settings) {

    console.log(settings.minutes);
    console.log(settings.seconds);

    var tileWidth = Math.floor(100.0 / settings.teams.length);
    console.log(tileWidth);

    var $teams = $(".team");
    var $picks = $(".pick");
    var $tiles = $(".team, .pick");

    // if (settings.serpentine) {
    //   var $evenRounds = $(".round.even");
    //   $evenRounds.each(function() {
    //     var evenPicks = $(this).children();
    //     $(this).append(evenPicks.get().reverse());
    //   });
    // }

    $tiles.each(function(){
      $(this).css({width: tileWidth + "%"});
    });

    // don't square the team names
    $picks.each(function() {
      $(this).height($(this).width());
    });

    $(window).resize(function() {
      scaleBoard($(this).width());
    });

    scaleBoard($(window).width());

  }
  
  init(settings);

});
