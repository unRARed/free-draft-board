$(document).ready(function() {
  
  var rounds = 15;
  var serpentine = true;
  
  var hard_coded_teams = [
    'nerds', 'goofy', 'blah', 'meh', 'haha',
    'what', 'woot', 'lol', 'ok', 'word',
    'gogo', 'booyah', 'heyo', 'moolah',
    'hammer', 'mahjong', 'colar', 'boostay',
    'sherpa', 'goose'
  ];
  
  function init(teams, rounds, is_serpentine) {
    
    var odd_round = true;
    
    var teams_div = document.createElement('div');
    teams_div.className = "league";
    $(".board").append(teams_div);
  
    for (i=0; i<teams.length; i++) {
      var div = document.createElement('div');
      div.id = teams[i];
      div.innerHTML = teams[i];
      div.className = "team";
      teams_div.appendChild(div);
    }
    
    var pick_count = 0;
    
    function createPick(team_index) {
      pick_div = document.createElement('div');
      pick_div.id = "pick_" + i + "_" + (pick_count + j);
      pick_div.className = "pick";
      pick_div.innerHTML = pick_count + j;
      pick_div.dataset.team = teams[team_index]; 
      round_div.appendChild(pick_div);
    }
    
    for (i=1; i<=rounds; i++) {
      
      var even_round_index = 0;
      var pick_div;
      
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
      var round = this.id.substr(5,1);
      var pick = this.id.substr(7, this.id.length);
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
  
  init(hard_coded_teams, rounds, serpentine);
  
});
