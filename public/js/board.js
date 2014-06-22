$(document).ready(function() {
  
  function init(settings) {

    function scaleBoard(boardWidth) {
      if (initialRender || shouldResize) {
        while (boardWidth % settings.teams.length !== 0) { boardWidth--; }
        var unitWidth = (boardWidth / settings.teams.length);
        var pixelFraction = 1 / settings.teams.length;
        $(".league, .round").css({width: boardWidth + "px"});
        $(".pick").css({width: (unitWidth - pixelFraction) + "px"});
        var actualWidth = $(".pick").first().css('width');
        $(".pick").css({height: actualWidth});
        $(".team").css({width: (unitWidth - pixelFraction) + "px"});
        shouldResize = false;
        initialRender = false;
      }
      setTimeout(function() {
        shouldResize = true;
      }, 100);
    }

    // console.log(settings.minutes);
    // console.log(settings.seconds);

    var shouldResize = false;
    var initialRender = true; // to skip timeout logic on initial board scaling

    var tileWidth = Math.floor(100.0 / settings.teams.length);

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
