$(document).ready(function() {

  $(".pick").click(function() {
      var round = this.parentNode.id.substr(6,this.parentNode.id.length);
      var pick = this.id.substr(5, this.id.length);
      $("#team_id").html($(this).data("team"));
      $("#team_name").val($(this).data("team"));
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
    }
  });
    
  $("#selection_form").submit(function(evt) {
    var formData = $(this).serialize();
    evt.preventDefault();
    
    $.post( "/select", formData, function(data) {
      $("#" + $("#full_pick_id").val()).append( data );
      $( ".result" ).html( data );
      $("#player_name").val("");
      $("#selection, #selection-blanket").hide();
    });

  });

});
