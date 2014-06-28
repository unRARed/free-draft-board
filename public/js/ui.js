$(document).ready(function() {

  var pickCount = $(".pick").size(),
      teamCount = $(".team").size();
  var timeBoxInstance;
  $.livetime.options.serverTimeUrl = '/time-ref.txt';

  function changeActivePick(forward) {
    // sets active element if direction boolean not passed
    // if passed, it finds active element, sets inactive
    // and sets previous or next element active
    var currentPick;
    var $newPick;

    startCountDown(countDown);

    if (forward === undefined) {
      currentPick = openPicks[0].pick; // get first available pick number
      if (!$("#pick-" + currentPick).hasClass('active')) {
        $("#pick-" + currentPick).addClass('active');
      }
      return;
    }

    //parameter is set so we need to grab current active pick number
    currentPick = parseInt($(".pick.active").attr("id").substr(5));

    if (!forward && currentPick > 1) {
      $newPick  = $("#pick-" + (currentPick - 1));
      $("#pick-" + currentPick).removeClass('active');
      $newPick.addClass('active');
    } else if (forward && currentPick < pickCount) {
      $newPick  = $("#pick-" + (currentPick + 1));
      $("#pick-" + currentPick).removeClass('active');
      $newPick.addClass('active');
    }
  }

  var timeBox = (function(msFromNow) {

    function fullTimeStamp(ms) {
      var nowTime = new Date().getTime();
      return nowTime + ms;
    }
    var originalTime = msFromNow;
    var timeRemaining = msFromNow;
    var initialTimeStamp = fullTimeStamp(msFromNow);

    return {
      update: (function() {
        console.log(timeRemaining);
        timePassed = (initialTimeStamp - fullTimeStamp(0));
        timeRemaining = originalTime - (originalTime - timePassed);
      }),
      get: (function() {
        return fullTimeStamp(timeRemaining);
      })
    }
  });

  function startCountDown(milliseconds) {
    console.log('called countDown function');
    timeBoxInstance = timeBox(milliseconds);
    $("#count-down").attr('datetime', timeBoxInstance.get());
    $("#count-down").livetime();
  }

  $(".pick").click(function() {
      var round = this.parentNode.id.substr(6,this.parentNode.id.length);
      var pick = this.id.substr(5, this.id.length);
      $("#team_id").html($(this).data("team"));
      $("#teamName").val($(this).data("team"));
      $("#full_pick_id").val(this.id.substr(5,this.id.length));
      $("#short_id").val($(".board").attr("id"));
      $("#round_id").html(round);
      $("#pick_id").html(pick);
      $("#selection, #selection-blanket").show();
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
    
  $("#selection_form").submit(function(evt) {
    var formData = $(this).serialize();
    evt.preventDefault();
    
    $.post( "/select", formData, function(data) {
      $("#" + $("#full_pick_id").val()).append( data );
      $( ".result" ).html( data );
      $("#pick-" + $("#full_pick_id").val() + " .selected-value").html(data);
      $("#player_name").val("");
      $("#selection, #selection-blanket").hide();
      changeActivePick(true);
    });

  });

  $("#start-draft").click(function() {
    changeActivePick();
    $(this).hide();
    $("#pause-draft, #previous-pick, #next-pick").show();
  });

  $("#pause-draft").click(function() {
    timeBoxInstance.update();
    $("#count-down").livetime(false);
    $(this).hide();
    $("#resume-draft").show();
  });

  $("#resume-draft").click(function() {
    $("#count-down").attr('datetime', timeBoxInstance.get());
    $("#count-down").livetime();
    $(this).hide();
    $("#pause-draft").show();
  });

  $("#next-pick").click(function() {
    changeActivePick(true);
  });

  $("#previous-pick").click(function() {
    changeActivePick(false);
  });

});
