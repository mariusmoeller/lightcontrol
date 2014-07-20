meSpeak.loadConfig('lib/pong/mespeak_config.json');
meSpeak.loadVoice('lib/pong/en.json');

$(function() {
  // Handler for .ready() called.
  var $startButton = $('#btn-start-game');
  var $startWindow = $('#start-window')
  var $gameInfo    = $('#game-info');
  var $user1       = $('#user-1');
  var $user2       = $('#user-2');

  var user1         = ''
  var user2         = ''
  var user1Points   = 0;
  var user2Points   = 0;

  var isSinglePlayer = false;

  var updatePoints = function (scoringUser) {
        console.log(scoringUser);

      if (scoringUser == 1) {
        user1Points ++;
      } else if (scoringUser == 2) {
        user2Points ++;
      }
      $gameInfo.empty();
      $gameInfo.append('<p class="user user1">'+ user1 + '<span class"points">: ' + user1Points +'</span></p>');
      meSpeak.speak(user1 + '–' + user1Points,{volume : 0.9}, function () {
          if (!isSinglePlayer) {
            $gameInfo.append('<p class="user user2">'+ user2 + '<span class"points">: ' + user2Points +'</span></p>');
            meSpeak.speak(user2 + '–' + user2Points);
          }
      });
  }

  $startButton.click(function(e) {
      user1 = $user1.val();
      user2 = $user2.val();

      if (user1 == '') {
        alert('please enter at least one username');
        return false;
      }
      if (user2 == '') {
        isSinglePlayer = true;
      }

      $startWindow.hide();

      updatePoints();
      
  });

  //test function
  $('#update-points').click(function () {
      updatePoints(scoringUser = 1);
  });

});