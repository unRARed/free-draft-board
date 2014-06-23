$(document).ready(function() {

  $("#password_setting").change(function() {

    if ($(this).is(":checked")) {
      var $passes = $("#password_fields");
      $passes.empty().
        append('<input placeholder="Password" type="password" name="password_value" required>').
          append('<input placeholder="Confirm Password" type="password" name="pass_confirm_value" required>').
            show();
    } else {
      $("#password_fields").hide();
    }

  });

  $("#teams_setting").change(function() {

    var teams_showing = $(".team_submission").size();


    if ($(this).val() !== "") {

      $("#team_names").show();

      if (teams_showing < $(this).val()) {
        for (i=teams_showing; i<$(this).val(); i++) {
          $("#submit_settings").show();
          $("#team_names").append('<input placeholder="Team ' + (i + 1) + 
            '" class="team_submission" id="team_' + i + '" name="team_names[' + i + ']"type="text" required>')
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
