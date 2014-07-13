$(document).ready(function() {

  $.livetime.options.serverTimeUrl = '/time-ref.txt';
  $.livetime.options.formats.countDown = [
    [-4, 'd_mm:d_ss'],
    [-3, '<b>Three!</b>'],
    [-2, '<b>Two!</b>'],
    [-1, '<b>ONE!</b>'],
    ['<b>TIMES UP!</b>']
  ];

  var board = (function (spec) {

    var teamCount = $(".team").size();
    var pickCount = $(".pick").size();
    var shouldResize = false;
    var currentPick = spec.currentPick;
    var newPick = currentPick;
    var roundTimeInMS = spec.pickTime;
    var timeRemaining = roundTimeInMS;
    var baseTime = fullTimeStamp(roundTimeInMS);
    var refreshTimeRemaining;
    var active = true;

  ///////////////////////////////
  ////                       ////
  ////    Helper Functions   ////
  ////                       ////
  ///////////////////////////////

    function fullTimeStamp(ms) {
      var date = new Date();
      // use clients timezone
      var nowTimeUTC = date.getTime() - (date.getTimezoneOffset() * 60000);
      return nowTimeUTC + ms;
    }

    var resetTime = (function () {
      timeRemaining = roundTimeInMS;
      baseTime = fullTimeStamp(roundTimeInMS);
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
      $("#control-panel").hide();
    });

  ///////////////////////////////////
  ////                           ////
  ////   Board Instance Methods  ////
  ////                           ////
  ///////////////////////////////////

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

        var maintainedAspect = $(".pick").first().width() * 0.8;

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
      var timerDiv = '<time data-time-label="#countDown" class="count-down" id="count-down"></time>';
      // reset the coundDown timer
      resetTime();

      // swap active pick from old to new and reassign current pick
      $currentPick.removeClass('active');
      $currentPick.find('#count-down').remove();
      $currentPick.off('click');
      $newPick.addClass('active');
      $newPick.append(timerDiv);
      $('#count-down').attr('datetime', fullTimeStamp(timeRemaining));
      $('#count-down').data('duration', timeRemaining);
      $('#count-down').livetime();

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
      getMsRemaining: (function() {
        return timeRemaining;
      }),
      startTime: (function () {
        // reset base to now + current time remaining
        active = true;
        baseTime = fullTimeStamp(timeRemaining);
        refreshTimeRemaining = setInterval(function () {
          if (timeRemaining > 0) {
            var timePassed = (baseTime - fullTimeStamp(0));
            timeRemaining = roundTimeInMS - (roundTimeInMS - timePassed);
            console.log(timeRemaining);
          }
        }, 2000);
      }),
      pauseTime: (function () {
        active = false;
        clearInterval(refreshTimeRemaining);
      }),
      isActive: (function () {
        return active;
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

  $("#open-panel").click(function() {
    $(this).hide();
    $("#close-panel").css({'display': 'inline-block'}); 

    if (boardInstance.isActive()) {
      $("#pause-draft, #pick-nav").css({'display': 'inline-block'});
      $("#resume-draft").css({'display': 'none'});
    } else {
      $("#resume-draft").css({'display': 'inline-block'});
    }

  });

  $("#close-panel").click(function() {
    $(this).hide();
    $("#open-panel").css(
      {'display': 'inline-block'}
    );
    $("#pause-draft, #resume-draft, #pick-nav").css(
      {'display': 'none'}
    );  
  });

  $("#start-draft").click(function() {
    boardInstance.nextPick();
    boardInstance.startTime();
    $(this).hide();
    $("#open-panel, #count-down").css(
      {'display': 'inline-block'}
    );
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

  // $(".selection-value").click(function () {
  //   $("#entered-value").val($(this).text());
  // });

  $("#selection_form").submit(function(evt) {
    var formData = $(this).serialize();
    evt.preventDefault();
    
    $.post( "/select", formData, function(data) {
      var pickColor = '';
      $pick = $("#pick-" + $("#full_pick_id").val());
      if (poolType === 'football') {
        if (data.meta1 === 'QB') {
          $pick.addClass('meta-gold');
        } else if (data.meta1 === 'RB') {
          $pick.addClass('meta-green');
        } else if (data.meta1 === 'WR') {
          $pick.addClass('meta-blue');
        } else if (data.meta1 === 'TE') {
          $pick.addClass('meta-pink');
        } else if (data.meta1 === 'D/ST') {
          $pick.addClass('meta-brown');
        } else if (data.meta1 === 'K') {
          $pick.addClass('meta-magenta');
        }
      }
      $pick.find(".pick-value1").addClass('picked').html(data.value1);
      if (data.value2) {
        $pick.find(".pick-value2").html(data.value2);
      }
      $pick.find(".pick-meta1").html(data.meta1);
      $pick.find(".pick-meta2").html(data.meta2);
      $("#displayed-value").val("");
      $("#selection_id").val("");
      $("#selection_meta1").val("");
      $("#selection_meta2").val("");
      $("#selection, #selection-blanket").hide();
      boardInstance.nextPick('forward');
      $("#control-panel").show();
    });

  });

  $("#pause-draft").click(function() {
    boardInstance.pauseTime();
    $("#count-down").livetime(false);
    $("#pause-draft, #pick-nav").css(
      {'display': 'none'}
    );  
    $("#resume-draft").css(
      {'display': 'inline-block'}
    );
  });

  $("#resume-draft").click(function() {
    boardInstance.startTime();
    $("#count-down").attr('datetime', boardInstance.getTime());
    $("#count-down").data('duration', boardInstance.getMsRemaining());
    $("#count-down").livetime();
    $(this).hide();
    $("#pause-draft, #pick-nav").css(
      {'display': 'inline-block'}
    );
  });

  // if selection div is visible, 
  // hide it if user clicks outside
  $("#selection-blanket").click(function(evt) {
    if ($("#selection").is(evt.target)) {
      return;
    } else {
      $("#selection, #selection-blanket").hide();
      $("#displayed-value").val("");
      $("#control-panel").show();
    }
  });

});
