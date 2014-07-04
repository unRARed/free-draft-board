$(document).ready(function() {

  var board = (function (spec) {

    var teamCount = $(".team").size();
    var pickCount = $(".pick").size();
    var shouldResize = false;
    var currentPick = spec.currentPick;
    var newPick = spec.currentPick;

    var scale = (function (initial) {
      if (initial) { shouldResize = true; }
      console.log('scaling...');
      var boardWidth = $(window).width();
      if (shouldResize) {
        while (boardWidth % teamCount !== 0) { boardWidth--; }
        var unitWidth = (boardWidth / teamCount);
        var pixelFraction = 1 / teamCount;
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

        var maintainedAspect = $(".pick").first().width() * 0.6;

        $(".pick").css({height: maintainedAspect});
        $(".team").css({width: (unitWidth - pixelFraction) + "px"});
        shouldResize = false;
      }
      setTimeout(function() {
        shouldResize = true;
      }, 100);
    });

    var nextPick = (function () {
      var $currentPick = $("#pick-" + currentPick);
      var $newPick = $("#pick-" + newPick);
      console.log($currentPick);
      console.log($newPick);
      $currentPick.removeClass('active');
      //$currentPick.off('click');
      $newPick.addClass('active');
      currentPick = newPick;
    });


    return {
      scale: (function (initial) {
        scale(initial);
      }),
      nextPick: (function (direction) {
        if (direction === 'forward' && currentPick < pickCount) {
          newPick++;
        } else if (direction === 'reverse' && currentPick > 1) {
          newPick--;
        }
        nextPick();
      })


    }

  });

  var boardInstance = board({
    currentPick: openPicks[0].pick
  });

  boardInstance.scale(true);

  $("#start-draft").click(function() {
    boardInstance.nextPick();
    $(this).hide();
    $("#pause-draft, #previous-pick, #next-pick").show();
  });

  $(window).resize(function() {
    boardInstance.scale();
  });

  $("#next-pick").click(function() {
    boardInstance.nextPick('forward');
  });

  $("#previous-pick").click(function() {
    boardInstance.nextPick('reverse');
  });


});
