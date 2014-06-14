$(document).ready(function() {
  $(".pick").click(
    function() {
      var round = this.parentNode.id.substr(6,this.parentNode.id.length);
      var pick = this.id.substr(5, this.id.length);
      $("#team_id").html($(this).data("team"));
      $("#full_pick_id").val(this.id);
      $("#round_id").html(round);
      $("#pick_id").html(pick);
      $("#selection").show();
    }
  );

    
  $("#selection_form").submit(function(submit_event) {
    submit_event.preventDefault();
    $("#" + $("#full_pick_id").val()).append($("#player_name").val());
    $("#player_name").val("");
    $("#selection").hide();
  });
});
