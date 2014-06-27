$(document).ready(function() {

  $.livetime.options.serverTimeUrl = '/time-ref.txt';

  var timeBoxInstance;

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
    var tickingElement = "<time id=\"count-down\" datetime=\"" + timeBoxInstance.get() + 
      "\"><span data-time-label=\"d_mm:\"></span><span data-time-label=\"d_ss\"></span></time>";
    $(".count-down").html(tickingElement);
    $("#count-down").livetime();
  }

  $(".pick").click(function() {
      var round = this.parentNode.id.substr(6,this.parentNode.id.length);
      var pick = this.id.substr(5, this.id.length);
      $("#team_id").html($(this).data("team") + ",");
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
    });

  });

  $("#start-draft").click(function() {
    startCountDown(countDown);
    $(this).hide();
    $("#pause-draft").show();
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

});
