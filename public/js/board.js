$(document).ready(function() {

    var numTeams = $(".team").size();

    function scaleBoard(boardWidth) {
      if (initialRender || shouldResize) {
        while (boardWidth % numTeams !== 0) { boardWidth--; }
        var unitWidth = (boardWidth / numTeams);
        var pixelFraction = 1 / numTeams;
        var teamHeight;
        $(".team").each(function() {
            $(this).css({height: "auto"});
        });
        $(".team").each(function() {
            if (!teamHeight) {
                teamHeight = $(this).height();
            } else {
                if ($(this).height() > teamHeight) {
                    teamHeight = $(this).height();
                }
            }
        });
        $(".team").each(function() {
            $(this).height(teamHeight);
        });
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

    var shouldResize = false;
    var initialRender = true; // to skip timeout logic on initial board scaling

    var tileWidth = Math.floor(100.0 / numTeams);

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

    var nowTime = new Date().getTime();
    $("#count-down").attr('datetime', (nowTime + countDown));
    $.livetime.options.serverTimeUrl = 'empty.txt';

    $(".board").livetime();

});
