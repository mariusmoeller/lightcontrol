
/**
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author mwichary@google.com (Marcin Wichary)
 */
$('#methodList').change(function(){ 
  helper.method = $("#methodList")[0].selectedIndex ;
  if(helper.method >= 3){
    $('#labyrinthOptions').show();
    if(helper.method == 3){
      labyrinth.mode = "easy";
    }else{
      labyrinth.mode = "difficult";
    }
  }
});

$('#labConfDone').click(function(){
      labyrinth.init();
      $("body").children().hide();
      $('.bg').attr("src","img/route-" + labyrinth.mode + ".jpg");
      $('#race').show();
});

$('#backButton').click(function(){
    labyrinth.hide();
});

$('#back').click(function(){
  $('#gameFinished').modal('hide');
   labyrinth.hide();
});

$('#again').click(function(){
  $('#gameFinished').modal('hide');
  labyrinth.init();
})

$('#coordinates').click(function(){
  var i = $('#coordinatesInput').val();
  var coordinates = i.split(" ");
  for(var i=0;i<coordinates.length;i++){
    coordinates[i] = parseInt(coordinates[i]);
  }
  if(coordinates.length == 3)
    helper.socket.emit('setPosByDegrees', helper.transform3D(coordinates[0], coordinates[1], coordinates[2]), 0);
  else if(coordinates.length == 2)
    helper.socket.emit('setPos', coordinates, 0);
});

 var helper = {
  socket: io.connect(),
  method: 0,
  transform3D: function(x, y, z){
    var cX = 0;
    var cY = 1;
    var cZ = 0;
    var betragFuerAlpha = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    var skalarAlpha = cY * y + cX * x;
    var alpha = Math.acos(skalarAlpha / betragFuerAlpha);
    alpha /= Math.PI;
    alpha *= 180;
    if (x > 0){
      alpha -= 180;
      alpha *= -1;
      alpha += 180;
    }
    //Beta
    var distanceToMid = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    var beta = Math.atan(z / distanceToMid);
    beta /= Math.PI;
    beta *= 180;
    beta += 25;

    var data = [alpha, beta];
    $('#xPos').text(Math.round(alpha*100)/100);
    $('#yPos').text(Math.round(beta*100)/100);
    return data;
  }
};

var labyrinth = {
  mode : "",
  washHeight : 0,
  projectorHeight: 0,
  screenHeight : 0,
  screenWidth: 0,
  distance : 0,
  currentY : 0,
  currentZ : 0,
  yMax : 0,
  yMin:0,
  zMax : 0,
  zMin : 0,

  init: function(){
    this.initButtons();
    var median = 0;
    var startLine = window[labyrinth.mode + "StartLine"];
    for(var i=0;i<startLine.x.length;i++){
      median+=startLine.x[i];
    }
    median /= startLine.x.length;
    startLine.median = median;

    this.distance = parseInt($('#distance').val());
    this.washHeight = parseInt($('#washHeight').val());
    this.projectorHeight = parseInt($('#projectorHeight').val());
    this.screenHeight = parseInt($('#screenHeight').val());
    this.screenWidth = parseInt($('#screenWidth').val());

    
    this.zMax = this.projectorHeight - this.washHeight + this.screenHeight;
    this.zMin = this.projectorHeight - this.washHeight;
    this.yMax = Math.round(this.screenWidth / 2);
    this.yMin = Math.round((-1) * this.screenWidth / 2);

    //start line
    this.currentY = this.yMin + startLine.median;
    this.currentZ = this.zMax - startLine.y;

    this.sendPosition();
    helper.socket.emit('color', '#00ff00', 0);
    player.reset();
    $('#gameStatus').text("not yet started");
    $('#time').text("0");
    $('#totalTurns').text("0");
  },

  hide: function(){
    $("body").children().show();
    $('#race').hide();
  },

  move: function(direction){
    player.moves++;
    if(player.moves == 1){
      game.startGame();
    }
    var y = this.currentY;
    var z = this.currentZ;
    switch(direction){
      case "forward" :   z++;  break;
      case "backward" :  z--; break;
      case "right" : y++; break;
      case "left" : y--; break;
    }

    if(z > this.zMax || z < this.zMin || y > this.yMax || y < this.yMin){
      console.log("aus dem Feld raus");
      helper.socket.emit('color', '#ff0000', 0); //red
    }else{
      helper.socket.emit('color', '#00ff00', 0); //green
      var obstaclesImWeg = this.checkObstacles(y, z);
      if(!obstaclesImWeg){
        this.currentY = y;
        this.currentZ = z;
        this.sendPosition();

        var startLineImWeg = this.checkStartLine();
        if(startLineImWeg){
          console.log("start linie im weg");
          game.turnFinished();
          helper.socket.emit('color', '#ffff00', 0); //yellow
        }
       }else{
          console.log("crash");
          player.obstaclesCrashed++;
      //  player.updateScore();
          helper.socket.emit('color', '#0000ff', 0); //blue
       }
    }
  },

  sendPosition: function(){
    helper.socket.emit('setPosByDegrees', helper.transform3D(this.distance, this.currentY, this.currentZ), 0);
  },

  checkObstacles: function(y, z){
    var xInArray = Math.round(this.yMax + y);
    var yInArray = Math.round(this.zMax - z);
    var obstacles = window[labyrinth.mode + "Obstacles"];
    if(obstacles[yInArray]){
      if(obstacles[yInArray][xInArray]){
        return true;
      }
    }
      return false;
    },

    checkStartLine: function() {
      var xInArray = this.currentY + Math.round(this.screenWidth/2);
      var yInArray = this.zMax - this.currentZ;
      var startLine = window[labyrinth.mode + "StartLine"];
      if(yInArray == startLine.y){
        if(xInArray >= startLine.x[0] && xInArray <= startLine.x[startLine.x.length-1]){
          return true;
        }
      }
      return false; 
    },
    initButtons: function() {
      $('#hoch').click(function(){labyrinth.move("backward")});      
      $('#runter').click(function(){labyrinth.move("forward")});
      $('#rechts').click(function(){labyrinth.move("right")});
      $('#links').click(function(){labyrinth.move("left")});
    }
};

var game = {
  turnsToFinish : 3,
  timeHighScore : 0,
  pointHighScore : 0,
  totalTime : 0,
  turnTime : 0,
  timer : null,
  showStatus : function(seconds) {
    if($('#race').has('div').length){
      $('.alert').remove();
    }
    var alert = $('<div/>', {
          role: 'alert',
          text: 'Succes! You finished one turn in ' + seconds + ' seconds!',
          style: 'position: relative; top: 50px;'
    }).addClass('alert').addClass('alert-success');
    $('#race').append(alert);

    setTimeout(function() {
        $('.alert').fadeOut('slow');
    }, 2000); 
  },
  startGame : function() {
    this.turnsToFinish = 3;
    this.totalTime = 0;
    this.turnTime = 0;
    this.timer = null;
    $('#gameStatus').text("started");
    $('#totalTurns').text(game.turnsToFinish);
    this.timer = setInterval(function () {
        game.totalTime++;
        game.turnTime++;
        $('#time').text(game.totalTime);
        player.updateScore();
    }, 1000);
  },
  turnFinished : function() {
    var timeForRound = this.turnTime;
    player.turnsFinished++;
    if(player.turnsFinished < game.turnsToFinish){
      this.showStatus(timeForRound);
    }
    if(player.fastestTurn > timeForRound){
      player.fastestTurn = timeForRound;
    }
   
    $('#absolvedTurns').text(player.turnsFinished);
    if(player.turnsFinished == game.turnsToFinish){
      this.gameFinished();
    }
    this.turnTime = 0;
  },
  gameFinished : function() {
    clearInterval(this.timer);
    $('#gameTime').text(game.totalTime);
    $('#fastestTurn').text(player.fastestTurn);
    $('#totalScore').text(player.score);
    $('#gameFinished').modal();

    if(game.totalTime > this.timeHighScore){
      this.timeHighScore = game.totalTime;
    }
    if(player.score > game.pointHighScore){
      alert("Highscore");
      game.pointHighScore = player.score;
    }
    $('#gameStatus').text('finished');
    helper.socket.emit('color', '#ffffff', 0); //white 
  }
};

var player = {
  turnsFinished : 0,
  score : 0,
  moves : 0,
  obstaclesCrashed : 0,
  fastestTurn: 0,
  reset : function() {
    this.turnsFinished = 0;
    this.score = 0;
    this.moves = 0;
    this.obstaclesCrashed = 0;
    $('#score').text(this.score);
    $('#absolvedTurns').text(player.turnsFinished);
  },
  updateScore : function() {
    this.score = Math.round((this.moves - this.obstaclesCrashed / this.moves ) * (1 / game.totalTime)* 50);
    $('#score').text(this.score);
  }
};

// var obstacles = {
//   positions : [],
//   init : function() {
//     var yLeftBorder = -108;
//     var yRightBorder = 108;

//     var zMax1 = 140;
//     var zMin1 = 136;

//     var zMax2 = 90;
//     var zMin2 = 86;

//     var yStop1 = 32;
//     var yStop2 = -34;

//     for(var y=yLeftBorder;y<yRightBorder;y++){
//       for(var z=zMax1;z>zMin2;z--){
//         var pos = [y, z];
//         if(z  >=zMin1 && z <= zMax1)
//           if(y < yStop1)
//             this.positions.push(pos);
//         if(z  >=zMin2 && z <= zMax2)
//           if(y > -yStop2)
//             this.positions.push(pos);
//       }
//     }
//   }
// };

var controller = {
  // If the number exceeds this in any way, we treat the label as active
  // and highlight it.
  VISIBLE_THRESHOLD: 0.1,

  // How far can a stick move on screen.
  STICK_OFFSET: 25,

  // How â€œdeepâ€ does an analogue button need to be depressed to consider it
  // a button down.
  ANALOGUE_BUTTON_THRESHOLD: .5,

  gasPressed: false,
  breakPressed: false,
  init: function() {
    this.updateGamepads();
  },

  /**
   * Update the gamepads on the screen, creating new elements from the
   * template.
   */
   updateGamepads: function() {
    var el = document.createElement('li');

    // Copy from the template.
    el.innerHTML =
    document.querySelector('#gamepads > .template').innerHTML;

    el.id = 'gamepad-0';
    el.querySelector('.name').innerHTML =  "Lightcontrol IMI 2014"; //gamepad.id ||
    el.querySelector('.index').innerHTML = 0; //gamepad.iid

    document.querySelector('#gamepads').appendChild(el);
  },

  /**
   * Update a given button on the screen.
   */
   updateButton: function(button, gamepadId, id) {
    var gamepadEl = document.querySelector('#gamepad-' + gamepadId);

    var value, pressed;

    // Older version of the gamepad API provided buttons as a floating point
    // value from 0 to 1. Newer implementations provide GamepadButton objects,
    // which contain an analog value and a pressed boolean.
    if (typeof(button) == 'object') {
      value = button.value;
      pressed = button.pressed;
    } else {
      value = button;
      pressed = button > this.ANALOGUE_BUTTON_THRESHOLD;
    }

    // Update the button visually.
    var buttonEl = gamepadEl.querySelector('[name="' + id + '"]');
    var bId = id.substring(id.length-1);
    if (buttonEl) { // Extraneous buttons have just a label.
      if (pressed) {
        buttonEl.classList.add('pressed');
        if(bId >= 1 && bId <= 4){
          this.buttonPressed(bId);
        }
        if(bId == "m" && helper.method == 1){
          var orientation = "";
          if(id == "button-left-shoulder-bottom"){
            orientation = "backward";
          }else if(id == "button-right-shoulder-bottom"){
            orientation = "forward";
          }
          this.sendOrientation(orientation);
        }
      } else {
        if(helper.method ==2){
          if(bId == 1){
            this.gasPressed = false;
          }
          else if(bId == 2){
            this.breakPressed = false;
          }
        buttonEl.classList.remove('pressed');
      }
    }
  }
  },

  /**
   * Update a given analogue stick on the screen.
   */
   updateAxis: function(value, gamepadId, labelId, stickId, horizontal) {
    if((helper.method >= 0 && helper.method <= 2)|| helper.method >= 3){  
      if(stickId == "stick-2" || stickId == "stick-1"){
        this.sendPos(value, horizontal);
      }
    }
    var gamepadEl = document.querySelector('#gamepad-' + gamepadId);

    // Update the stick visually.

    var stickEl = gamepadEl.querySelector('[name="' + stickId + '"]');
    if (stickEl) { // Extraneous sticks have just a label.
      var offsetVal = value * this.STICK_OFFSET;

      if (horizontal) {
        stickEl.style.marginLeft = offsetVal + 'px';
      } else {
        stickEl.style.marginTop = offsetVal + 'px';
      }
    }
  },

  buttonPressed: function(id) {
    var orientations = [
                  // A    B   X   Y
                  ["backward", "right", "left", "forward"],    //method 0
                  [],                                                      //method 1
                  ["forward", "backward", 0, 0],              //method 2
                  ["backward", "right", "left", "forward"]    //method 3 -- labyrinth
    ];
    var o = orientations[helper.method][id-1];
    if(o)
       this.sendOrientation(o);
  },

  sendPos: function(value, horizontal){
    var nextStep = {x:0, y:0};
    if(value>0.75 || value<-0.75){
      if(horizontal)
        nextStep.x = value;
      else
        nextStep.y = value;
      this.move(nextStep);
    }
  },

  sendOrientation:function(direction){
    if(helper.method < 3){
      var data = {x: 0, z:0};
      switch(direction){
        case "forward" :  data.x = -1;if(helper.method>0) this.gasPressed=true; break;
        case "backward" : data.x = 1; if(helper.method>0) this.breakPressed=true;break;
        case "right" : data.z = 1;break;
        case "left" : data.z = -1;break;
      }
      helper.socket.emit('move', data, 0);
    }else{
      labyrinth.move(direction);
    }
  },

  move: function(step){
    var x = step.x;
    var y = step.y;
    var orientation;
    if(x > 0){
      if(y>0){
        if(x>y){
          orientation = "right";
        }else{
          orientation = "backward";
        }
      }else{
        if(x>y){
          orientation = "right";
        }else{
          orientation = "forward";
        }
      }
    }else{
      if(y>0){
        if(y>x){
          orientation = "backward";
        }else{
          orientation = "left";
        }
      }else{
        if(y>x){
          orientation = "left";
        }else{
          orientation = "forward";
        }
      }
    }
    this.sendOrientation(orientation);
  }
};