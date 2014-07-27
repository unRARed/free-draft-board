$(document).ready(function() {

  ///////////////////////////////////
  ////                           ////
  ////  Client-side Board Model  ////
  ////                           ////
  ///////////////////////////////////

  $.livetime.options.serverTimeUrl = '/time-ref.txt';
  $.livetime.options.formats.countDown = [
    [-4, 'd_mm:d_ss'],
    [-3, '<b>Three!</b>'],
    [-2, '<b>Two!</b>'],
    [-1, '<b>ONE!</b>'],
    ['<b>TIMES UP!</b>']
  ];

  var board = (function (spec) {

    var boardId = $(".board").attr("id");
    var teamCount = $(".team").size();
    var pickCount = $(".pick").size();
    var shouldResize = false;
    var poolType = spec.poolType;
    var completed = spec.completed;
    var currentPick = spec.currentPick; // get from db
    var newPick = currentPick;
    var roundTimeInMS = spec.countDown;
    var timeRemaining = roundTimeInMS; // get from db
    var timeStarted = timeStarted || fullTimeStamp(roundTimeInMS);
    var active = spec.active;
    var paused = spec.paused;
    var adminInterval; // runs until pick time expires
    var globalFastInterval; // runs constantly
    var globalSlowInterval;
    var picks = [];
    var openPicks = [];
    var admin = spec.admin;

  ///////////////////////////////
  ////    Helper Functions   ////
  ///////////////////////////////

    var addColor = (function (metaString) {
      var color = '';
      if (poolType === 'football') {
        if (metaString === 'QB') {
          color = 'meta-gold';
        } else if (metaString === 'RB') {
          color = 'meta-green';
        } else if (metaString === 'WR') {
          color = 'meta-blue';
        } else if (metaString === 'TE') {
          color = 'meta-pink';
        } else if (metaString === 'D/ST') {
          color = 'meta-brown';
        } else if (metaString === 'K') {
          color = 'meta-magenta';
        }
      }
      return color;
    });

    var populatePickData = (function () {
      for (i=0;i<picks.length;i++) {

        $.each(picks[i], function(key, value) {

          if (picks[i]['value1']) { // no need to work with undefined values

            var pickId = picks[i]['pick'];
            var newTeam = picks[i]['team'];
            var newMeta1 = picks[i]['meta1'];
            var newMeta2 = picks[i]['meta2'];
            var newValue1 = picks[i]['value1'];
            var newValue2 = picks[i]['value2'];
            var $existing = $('#pick-' + pickId);
            var $existingTeam = $('#pick-' + pickId).find('.pick-team');
            var $existingMeta1 = $('#pick-' + pickId).find('.pick-meta1');
            var $existingMeta2 = $('#pick-' + pickId).find('.pick-meta2');
            var $existingValue1 = $('#pick-' + pickId).find('.pick-value1');
            var $existingValue2 = $('#pick-' + pickId).find('.pick-value2');

            if ($existingValue1.text() !== newValue1 || $existingValue1.text() !== "") {

              $existingValue2.text(newValue2);
              $existingValue1.text(newValue1).addClass('picked');
              if ($existingMeta1) {
                $existing.addClass(addColor(newMeta1));
                $existingMeta1.text(newMeta1);
                if (poolType === 'football') {
                  $existingMeta2.text("Bye: " + newMeta2);
                } else {
                  $existingMeta2.text(newMeta2);
                }
              }

              $existingTeam.text(newTeam);
            }

          }

        });
        
      }
    });

    var setActivePick = (function () {
      console.log('current pick is ' + currentPick)
      var $existingPick = $(".active.pick");
      var $newPick = $("#pick-" + currentPick);

      $existingPick.removeClass('active');

      $newPick.addClass('active');
      newPick = currentPick;

      if (admin) {
        $existingPick.off('click');
        $newPick.click(function() {
          select();
        });
      }

      focusWindow();
    });

    var updateClientState = (function () {
      $.get('/state', {shortId: boardId}, function (response) {
        paused = response.paused;
        currentPick = response.currentPick;
        timeRemaining = response.timeRemaining;
        timeStarted = response.timeStarted;
        picks = response.picks;
        openPicks = response.openPicks;
        active = response.active;
        $('#count-down').attr('datetime', fullTimeStamp(timeRemaining));
        $('#count-down').data('duration', timeRemaining);
        if (paused) {
          $("#count-down").livetime(false);
        } else {
          $("#count-down").livetime();
        }
      });
    });

    var updateTimeRemaining = (function () {
      $.post('/updateTimeRemaining', {shortId: boardId, clientTime: fullTimeStamp(0)}, function (response) {
        timeRemaining = response.timeRemaining;
      });
    });

    function fullTimeStamp(ms) {
      var date = new Date();
      // use clients timezone
      var nowTimeUTC = date.getTime() - (date.getTimezoneOffset() * 60000);
      return nowTimeUTC + ms;
    }

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
      $("#selection, #modal-blanket").show();
      $("#previous-pick, #next-pick").hide();
    });

  ///////////////////////////////////
  ////   Board Instance Methods  ////
  ///////////////////////////////////


    var prepareNextPick = (function () {
      $("#pick-" + openPicks[0]).addClass('active').click(function() {
        select();
      });

      nextPick({
        pickId: openPicks[0]
      });
    });

    var scale = (function (initial) {
      if (initial) { shouldResize = true; }
      var boardWidth = $(window).width();
      if (shouldResize) {

        while (boardWidth % teamCount !== 0) { boardWidth--; }
        var unitWidth = (boardWidth / teamCount);
        var teamHeight;
        var maintainedAspect = unitWidth * 0.7;

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
        $(".pick").css({width: (unitWidth - .5) + "px"});
        $(".pick").css({height: maintainedAspect});
        $(".team").css({width: (unitWidth - .5) + "px"});

        // font-resizing and div hiding
        if (unitWidth < 30) {
          $('.pick-team, .pick-meta, .pick-value2, .pick-count').hide();
          $('.board').css({'font-size': '7px'});
        } else if (unitWidth < 100) {
          $('.pick-team, .pick-meta, .pick-value2').hide();
          $('.pick-count').show();
          $('.board').css({'font-size': '7px'});
        } else if (unitWidth < 130) {
          $('.pick-team, .pick-meta').hide();
          $('.pick-value2, .pick-count').show();
          $('.board').css({'font-size': '8px'});
        } else if (unitWidth < 190) {
          $('.pick-team').hide();
          $('.pick-meta, .pick-value2, .pick-count').show();
          $('.board').css({'font-size': '10px'});
        } else if (unitWidth > 190) {
          $('.pick-team, .pick-meta, .pick-value2, .pick-count').show();
          $('.board').css({'font-size': '14px'});
        }

        shouldResize = false;
      }
      setTimeout(function() {
        shouldResize = true;
      }, 100);
    });

    var nextPick = (function (options) {
      var pickId;
      if (options.pickId) {
        pickId = options.pickId;
      } else { 
        pickId = newPick;
      }
      $.post( "/newPick", {shortId: boardId, timeStarted: fullTimeStamp(0), currentPick: pickId}, function(pickValue) {
      });
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
      nextPick: (function (options) {
        var shiftedPick = currentPick;
        if (options.forward && currentPick < pickCount) {
          shiftedPick++;
        } else if (!options.forward && currentPick > 1) {
          shiftedPick--;
        }
        nextPick({
          pickId: shiftedPick
        });
      }),
      nextOpenPick: (function () {
        var nextOpenPick = openPicks[0];

        nextPick({
          pickId: nextOpenPick
        });
      }),
      makeSelection: (function (formData) {
        var pickId = parseInt($("#full_pick_id").val(), 10);
        $.post( "/select", formData, function(response) {
          var pickColor = '';
          $pick = $("#pick-" + $("#full_pick_id").val());
          $pick.find(".pick-value1").addClass('picked').html(response.value1);
          if (response.value2) {
            $pick.find(".pick-value2").html(response.value2);
          }
          $pick.find(".pick-meta1").html(response.meta1);
          $pick.find(".pick-meta2").html(response.meta2);
          $("#displayed-value").val("");
          $("#selection_id").val("");
          $("#selection_meta1").val("");
          $("#selection_meta2").val("");
          $("#selection-value1").val("");
          $("#selection-value2").val("");
          $("#selection, #modal-blanket").hide();
          $("#previous-pick, #next-pick").show();
          openPicks.splice(openPicks.indexOf(pickId), 1);
          console.log(openPicks.length);
          if (openPicks.length < 1) {
            // TODO: display confirm draft over div
            // if user confirms, mark completed
            $('#completed, #modal-blanket').show();
          } else {
            prepareNextPick();
          }
        });
      }),
      getTime: (function() {
        return fullTimeStamp(timeRemaining);
      }),
      getMsRemaining: (function() {
        return timeRemaining;
      }),
      startTime: (function (options) {

        if (admin && !active) { // on first fire, set board globally active in DB
          $.post('/board/' + boardId + '/active', function (response) {
            active = response.active;
          });
        }

        if (admin) {
          adminInterval = setInterval(function () {
            updateTimeRemaining();
          }, 5000);
        }

        // set next pick (resetting time values) on load
        // ONLY if the client has admin rights
        if (admin && options.initialRun) {
          nextPick({
            pickId: openPicks[0]
          });
        }

        // update state and set active pick
        // for all clients on first load
        if (options.initialRun) {
          updateClientState();
          setActivePick();
        }

        globalFastInterval = setInterval(function () {

          if (newPick !== currentPick) {
            setActivePick();
          }
          
        }, 1000);

        globalSlowInterval = setInterval(function () {
          populatePickData();
          updateClientState();
        }, 4000);

      }),
      toggleTime: (function () {
        updateTimeRemaining();
        clearInterval(adminInterval);
        $.post('/toggleTime', {shortId: boardId}, function (response) {
          console.log(response);
          paused = response.isPaused;
        });
      }),
      isActive: (function () {
        return active;
      }),
      timerIsActive: (function () {
        return !paused;
      }),
      picksRemaining: (function () {
        return openPicks.length;
      }),
      isAdmin: (function () {
        return admin;
      })
    }

  });

  if (!timeStarted) {
    var timeStarted = null;
  }

  if (!timeRemaining) {
    var timeRemaining = null;
  }

  var boardInstance = board({
    currentPick: currentPick,
    countDown: countDown,
    timeStarted: timeStarted,
    timeRemaining: timeRemaining,
    poolType: poolType,
    completed: completed,
    admin: admin,
    paused: paused,
    active: active
  });

  boardInstance.scale(true);

  ////////////////////////////////////
  ////                            ////
  ////    User Interface Stuff    ////
  ////                            ////
  ////////////////////////////////////

  if (boardInstance.isAdmin()) {

    $("#open-panel").click(function() {
      $(this).hide();
      $("#close-panel").css({'display': 'inline-block'}); 

      if (boardInstance.timerIsActive()) {
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
      $("#open-panel, #count-down").css(
        {'display': 'inline-block'}
      );
      boardInstance.startTime({
        initialRun: true
      });
      $(this).hide();
    });

    $("#resume-draft").click(function() {
      boardInstance.toggleTime();
      $(this).hide();
      $("#pause-draft, #pick-nav").css(
        {'display': 'inline-block'}
      );
    });

    $("#pause-draft").click(function() {
      boardInstance.toggleTime();
      $("#pause-draft, #pick-nav").css(
        {'display': 'none'}
      );  
      $("#resume-draft").css(
        {'display': 'inline-block'}
      );
    });

    $("#next-pick").click(function() {
      boardInstance.nextPick({
        forward: true
      });
    });

    $("#previous-pick").click(function() {
      boardInstance.nextPick({
        forward: false
      });
    });

    $("#selection_form").submit(function(evt) {
      var formData = $(this).serialize();
      evt.preventDefault();
      
      boardInstance.makeSelection(formData);
    });

    $('#cancel-completed').click(function() {
      $("#completed, #modal-blanket").hide();
    });

    // if selection div is visible, 
    // hide it if user clicks outside
    $("#modal-blanket").click(function(evt) {
      if ($("#selection").is(evt.target)) {
        return;
      } else {
        $("#selection, #completed, #modal-blanket").hide();
        $("#displayed-value").val("");
      }
    });

  }

  $('#show-admin-login').click(function () {
    $('.admin-login').show();
    $(this).hide();
  });

  $(window).resize(function() {
    boardInstance.scale();
  });

  if (!boardInstance.isAdmin()) {
    $('#count-down').css({'display': 'inline-block'});
  }

  // basically same as clicking start draft
  if (!boardInstance.isAdmin() ||
    (boardInstance.isAdmin() && boardInstance.isActive())) {
    boardInstance.startTime({
      initialRun: true
    });
  }

  if (boardInstance.isActive()) {
    $('#start-draft').hide();
    $("#open-panel, #count-down").css(
      {'display': 'inline-block'}
    );
  }

});
