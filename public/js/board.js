$(document).ready(function() {
  
  function init(teams, rounds, is_serpentine, unique_id) {

    var tile_width = (100 / teams.length);
    var odd_round = true;

    window.location.hash = unique_id;
    
    var teams_row = document.createElement('div');
    teams_row.className = "league";
    $(".board").append(teams_row);
  
    for (i=0; i<teams.length; i++) {
      var team_div = document.createElement('div');
      team_div.id = teams[i];
      team_div.innerHTML = teams[i];
      team_div.style.width = tile_width + '%';
      team_div.className = "team";
      teams_row.appendChild(team_div);
    }
    
    var pick_count = 0;
    
    function createPick(team_index) {
      var pick_div = document.createElement('div');
      var pick_span = document.createElement('span');
      pick_div.id = "pick_" + (pick_count + j);
      pick_div.className = "pick";
      pick_div.style.width = tile_width + '%';
      pick_div.dataset.team = teams[team_index];
      pick_span.innerHTML = pick_count + j;
      pick_span.className = "pick_count";

      pick_div.appendChild(pick_span);
      round_div.appendChild(pick_div);
    }
    
    for (i=1; i<=rounds; i++) {
      
      var even_round_index = 0;
      
      if (is_serpentine) {
        odd_round = (i % 2);
      }
      
      var round_div = document.createElement('div');
      round_div.id = "round_" + i;
      round_div.className = "round";
      $(".board").append(round_div);
      
      if (odd_round) {
        for (j=1; j<teams.length + 1; j++) {
          createPick(j-1);
        }           
      } else {
        for (j=teams.length; j>0; j--) {
          createPick(even_round_index);
          even_round_index++;
        }           
      }
      
      pick_count += teams.length;
      
    }
    
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
    
  }
  
  init(settings.team_names, settings.round, settings.serpentine, settings.id);
  
});
