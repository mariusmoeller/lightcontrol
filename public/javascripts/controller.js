
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
//var socket = io.connect();
$('#methodList').change(function(){ 
      controller.method = $("#methodList")[0].selectedIndex ;
      if(controller.method == 3){
          lab.currentY = (lab.screenWidth / 2) * (-1) + 5;
          lab.currentZ = lab.projectorHeight - lab.washHeight + lab.screenHeight;
          var coordinates = {x : lab.distance, y: lab.currentY, z: lab.currentZ};
          var co2d = controller.transform3D(coordinates);
          controller.socket.emit('setPosByDegrees', co2d, 0);
      }
});
$('#coordinates').click(function(){
    var i = $('#coordinatesInput').val();
    var coordinates = i.split(" ");
    for(var i=0;i<coordinates.length;i++){
      coordinates[i] = parseInt(coordinates[i]);
    }
    controller.showPos(coordinates);
});

var lab = {
  washHeight : 78,
  projectorHeight: 112,
  screenHeight : 155,
  screenWidth: 215,
  distance : 450,
  currentY : 0,
  currentZ : 0
};

//var gasPressed = false;
//var breakPressed = false;
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
  method: 0,
  socket: io.connect(),
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
        if(bId == "m" && this.method == 1){
          var orientation = "";
          if(id == "button-left-shoulder-bottom"){
            orientation = "backward";
          }else if(id == "button-right-shoulder-bottom"){
            orientation = "forward";
          }
         this.sendOrientation(orientation);
        }
      } else {
        if(this.method ==2){
          if(bId == 1){
            this.gasPressed = false;
          }else if(bId == 2){
            this.breakPressed = false;
          }
      }
        buttonEl.classList.remove('pressed');
      }
    }
  },

  /**
   * Update a given analogue stick on the screen.
   */
  updateAxis: function(value, gamepadId, labelId, stickId, horizontal) {
  if(this.method >= 0 && this.method <= 2){  
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
                  ["backward", "right", "left", "forward"], //method 0
                  [],                                                                     //method 1
                  ["forward", "backward", 0, 0],                   //method 2
                  ["backward", "right", "left", "forward"]    //method 3 -- labyrinth
      ];
      var o = orientations[this.method][id-1];
      if(o)
          if(this.method < 3)
           this.sendOrientation(o);
          else
            this.labyrinth(o);
  },

  sendPos: function(value, horizontal){
    var nextStep = {x:0, y:0};
    if(value>0.75 || value<-0.75){
        if(horizontal){
          //x
          nextStep.x = value;
        }else{
          //y
          nextStep.y = value;
        }
        this.move(nextStep);
      }
  },

  sendOrientation:function(direction){
    var data = {x: 0, z:0};
    switch(direction){
      case "forward" :  data.x = -1;if(this.method>0) this.gasPressed=true; break;
      case "backward" : data.x = 1; if(this.method>0) this.breakPressed=true;break;
      case "right" : data.z = 1;break;
      case "left" : data.z = -1;break;
    }
    this.socket.emit('move', data, 0);
  },

  labyrinth: function(direction){
    var data = {y: 0, z:0};
    switch(direction){
      case "forward" :  data.z = 1; break;
      case "backward" : data.z = -1;break;
      case "right" : data.y = 1;break;
      case "left" : data.y = -1;break;
    }
    lab.currentZ += data.z;
    lab.currentY += data.y;

    var coordinates = {x : lab.distance, y: lab.currentY, z: lab.currentZ};
    var co2d = controller.transform3D(coordinates);
    controller.socket.emit('setPosByDegrees', co2d, 0);
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
  },

  transform3D:function(coordinates){
            var x = coordinates.x;
            var y = coordinates.y;
            var z = coordinates.z;
            var cX = 0;
            var cY = 1;
            var cZ = 0;
            var betragFuerAlpha = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
            var skalarAlpha = cY * y + cX * x;
            var alpha = Math.acos(skalarAlpha / betragFuerAlpha);
            alpha /= Math.PI;
            alpha *= 180;
            if (x > 0)
            {
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
            return data;
       },

showPos:function(coordinates){
    if(coordinates.length == 3){
            var x = coordinates[0];
            var y = coordinates[1];
            var z = coordinates[2];
            var cX = 0;
            var cY = 1;
            var cZ = 0;
            var betragFuerAlpha = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
            var skalarAlpha = cY * y + cX * x;
            var alpha = Math.acos(skalarAlpha / betragFuerAlpha);
            alpha /= Math.PI;
            alpha *= 180;
            if (x > 0)
            {
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
            console.log(data);
           this.socket.emit('setPosByDegrees', data, 0);
         }else if(coordinates.length == 2){

            this.socket.emit('setPos', coordinates, 0);
         }
       }
};
