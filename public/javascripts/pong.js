meSpeak.loadConfig('lib/pong/mespeak_config.json');
meSpeak.loadVoice('lib/pong/en.json');

$(function() {
  // Handler for .ready() called.
  var $startButton = $('.btn-start-game');
  var $startWindow = $('#start-window')
  var $gameInfo    = $('#game-info');
  var $user1       = $('#player1');
  var $user2       = $('#player2');

  var user1         = ''
  var user2         = ''
  var user1Points   = 0;
  var user2Points   = 0;

  var updatePoints = function (scoringUser) {
      if (scoringUser == 1) {
        user1Points ++;
      } else if (scoringUser == 2) {
        user2Points ++;
      }
      $gameInfo.empty();
      $gameInfo.append('<p class="user user1">'+ user1 + '<span class"points">: ' + user1Points +'</span></p>');
      meSpeak.speak(user1 + '–' + user1Points,{volume : 0.9}, function () {
            $gameInfo.append('<p class="user user2">'+ user2 + '<span class"points">: ' + user2Points +'</span></p>');
            meSpeak.speak(user2 + '–' + user2Points);
      });
  }

  $startButton.click(function(e) {
      user1 = $user1.val();
      if(this.name == "1player"){
        user2 = "Computer";
      }else{
        user2 = $user2.val();
      }
      $('#pongLogo').hide();
      $('#playerMode').hide();
      $('#update-points').show();
      updatePoints();
  });

  //test function
  $('#update-points').click(function () {
      updatePoints(scoringUser = 1);
  });

});