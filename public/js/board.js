$(document).ready(function() {

  $.livetime.options.serverTimeUrl = '/time-ref.txt';

  var board = (function (spec) {

    var teamCount = $(".team").size();
    var pickCount = $(".pick").size();
    var shouldResize = false;
    var currentPick = spec.currentPick;
    var newPick = currentPick;
    var roundTimeInMS = spec.pickTime;
    var timeRemaining = roundTimeInMS;
    var startTime = fullTimeStamp(roundTimeInMS);

  ///////////////////////////////
  ////                       ////
  ////    Helper Functions   ////
  ////                       ////
  ///////////////////////////////

    function fullTimeStamp(ms) {
      var nowTime = new Date().getTime();
      return nowTime + ms;
    }

    var resetTime = (function () {
      timeRemaining = roundTimeInMS;
      startTime = fullTimeStamp(roundTimeInMS);
    });

    var select = (function () {
      var $currentPick = $("#pick-" + currentPick);
      var round = $currentPick[0].parentNode.id.substr(6,$currentPick[0].parentNode.id.length);
      var pick = $currentPick.attr('id').substr(5, $currentPick.attr('id').length);
      $("#team_id").html($currentPick.data("team"));
      $("#teamName").val($currentPick.data("team"));
      $("#full_pick_id").val($currentPick.attr('id').substr(5,$currentPick.attr('id').length));
      $("#short_id").val($(".board").attr("id"));
      $("#round_id").html(round);
      $("#pick_id").html(pick);
      $("#selection, #selection-blanket").show();
    });

  ///////////////////////////////////
  ////                           ////
  ////   Board Instance Methods  ////
  ////                           ////
  ///////////////////////////////////

    var updateTimeRemaining = (function () {
      var timePassed = (startTime - fullTimeStamp(0));
      timeRemaining = roundTimeInMS - (roundTimeInMS - timePassed);
    });

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
      var timerDiv = '<time class="count-down" id="count-down"> \
                      <span data-time-label="d_mm:"> 00:</span> \
                      <span data-time-label="d_ss"> 00</span></time>';
      // reset the coundDown timer
      resetTime();

      // swap active pick from old to new and reassign current pick
      $currentPick.removeClass('active');
      $currentPick.find('#count-down').remove();
      $currentPick.off('click');
      $newPick.addClass('active');
      $newPick.append(timerDiv);
      $newPick.attr('datetime', boardInstance.getTime());
      $newPick.livetime();

      currentPick = newPick;
      $newPick.click(function() {
        select();
      });
      focusWindow();
    });

    var focusWindow = function () {
      var $currentPick = $("#pick-" + currentPick);
      var selectorPosition = $currentPick.position();
      var $win = $(window);
      var halfHeight = $win.height() / 2;

      if (selectorPosition.top < $win.scrollTop()) {
        $win.scrollTop(selectorPosition.top - halfHeight);
      }
      if (selectorPosition.top > ($win.scrollTop() + halfHeight + $currentPick.height())) {
        $win.scrollTop(selectorPosition.top);
      }

    }

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
      }),
      getTime: (function() {
        return fullTimeStamp(timeRemaining);
      }),
      updateTime: (function () {
        updateTimeRemaining();
      })
    }

  });

  var boardInstance = board({
    currentPick: openPicks[0].pick,
    pickTime: countDown
  });

  boardInstance.scale(true);


  ////////////////////////////////////
  ////                            ////
  ////    User Interface Stuff    ////
  ////                            ////
  ////////////////////////////////////


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
    console.log(boardInstance.getTime());
  });

  $("#previous-pick").click(function() {
    boardInstance.nextPick('reverse');
  });

  $("#selection_form").submit(function(evt) {
    var formData = $(this).serialize();
    evt.preventDefault();
    
    $.post( "/select", formData, function(data) {
      $("#" + $("#full_pick_id").val()).append( data );
      $( ".result" ).html( data );
      $("#pick-" + $("#full_pick_id").val() + " .selected-value").html(data);
      $("#player_name").val("");
      $("#selection, #selection-blanket").hide();
      boardInstance.nextPick('forward');
    });

  });

  $("#pause-draft").click(function() {
    boardInstance.updateTime();
    $("#count-down").livetime(false);
    $(this).hide();
    $("#resume-draft").show();
  });

  $("#resume-draft").click(function() {
    $("#count-down").attr('datetime', boardInstance.getTime());
    $("#count-down").livetime();
    $(this).hide();
    $("#pause-draft").show();
  });

  // if selection div is visible, 
  // hide it if user clicks outside
  $("#selection-blanket").click(function(evt) {
    if ($("#selection").is(evt.target)) {
      return;
    } else {
      $("#selection, #selection-blanket").hide();
      $("#player_name").val("");
    }
  });

});
