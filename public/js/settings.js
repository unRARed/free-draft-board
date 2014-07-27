$(document).ready(function() {

  $("#teams_setting").change(function() {

    var teams_showing = $(".team-submission").size();


    if ($(this).val() !== "") {

      $("#teams-required").hide();

      $("#team_names").show();

      if (teams_showing < $(this).val()) {
        for (i=teams_showing; i<$(this).val(); i++) {
          $("#submit_settings").show();
          $("#team_names").append('<input placeholder="Team ' + (i + 1) + 
            '" class="team-submission text-input primary" id="team_' + i + '" name="team_names[' + i + ']"type="text" required>')
        }
      } else if (teams_showing > $(this).val()) {
        for (i=teams_showing; i>=$(this).val(); i--) {
          $("#team_" + i).remove();
        }
      }

    } else {
      $("#team_names").empty().hide();
      $("#submit_settings").hide();
    }

  });

});
