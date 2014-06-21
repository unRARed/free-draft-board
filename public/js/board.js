$(document).ready(function() {
  
  function init(settings) {

    function scaleBoard(boardWidth) {
      console.log(shouldResize);
      if (shouldResize) {
        while (boardWidth % settings.teams.length !== 0) { boardWidth--; }
        var unitWidth = (boardWidth / settings.teams.length);
        var pixelFraction = 1 / settings.teams.length;
        $(".league, .round").css({width: boardWidth + "px"});
        $(".pick").css({width: (unitWidth - pixelFraction) + "px", height: (unitWidth - pixelFraction) + "px"});
        $(".team").css({width: (unitWidth - pixelFraction) + "px"});
        shouldResize = false;
      }
      setTimeout(function() {
        shouldResize = true;
      }, 500);
    }

    console.log(settings.minutes);
    console.log(settings.seconds);

    var shouldResize = false;

    var tileWidth = Math.floor(100.0 / settings.teams.length);
    console.log(tileWidth);

    var $teams = $(".team");
    var $picks = $(".pick");
    var $tiles = $(".team, .pick");

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
