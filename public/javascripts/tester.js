
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
var lastId = 1000;
var nextStep = {x:null, y:null};
var socket = io.connect();
var method = 0;

$('#methodList').change(function(){ 
      method = $("#methodList")[0].selectedIndex ;
})

var gasPressed = false;
var breakPressed = false;
var tester = {
  // If the number exceeds this in any way, we treat the label as active
  // and highlight it.
  VISIBLE_THRESHOLD: 0.1,

  // How far can a stick move on screen.
  STICK_OFFSET: 25,

  // How â€œdeepâ€ does an analogue button need to be depressed to consider it
  // a button down.
  ANALOGUE_BUTTON_THRESHOLD: .5,
  init: function() {
    //tester.updateMode();
    tester.updateGamepads();
    // this.socket = socketio.connect();
  },

  /**
   * Tell the user the browser doesnâ€™t support Gamepad API.
   */
  showNotSupported: function() {
    document.querySelector('#no-gamepad-support').classList.add('visible');
  },

  /**
   * Update the gamepads on the screen, creating new elements from the
   * template.
   */
  updateGamepads: function(gamepads) {
    var els = document.querySelectorAll('#gamepads > :not(.template)');
    for (var i = 0, el; el = els[i]; i++) {
      el.parentNode.removeChild(el);
    }

    var padsConnected = false;

    if (gamepads) {
      for (var i in gamepads) {
        var gamepad = gamepads[i];

        if (gamepad) {
          var el = document.createElement('li');

          // Copy from the template.
          el.innerHTML =
              document.querySelector('#gamepads > .template').innerHTML;

          el.id = 'gamepad-' + i;
          el.querySelector('.name').innerHTML = gamepad.id;
          el.querySelector('.index').innerHTML = gamepad.index;

          document.querySelector('#gamepads').appendChild(el);
          padsConnected = true;
        }
      }
    }

 /*   if (padsConnected) {
      document.querySelector('#no-gamepads-connected').classList.remove('visible');
    } else {
     //document.querySelector('#no-gamepads-connected').classList.add('visible');
    }*/
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
      pressed = button > tester.ANALOGUE_BUTTON_THRESHOLD;
    }

    // Update the button visually.
    var buttonEl = gamepadEl.querySelector('[name="' + id + '"]');
    var bId = id.substring(id.length-1);
    
    if(method == 1){
      if(id == "button-right-shoulder-bottom"){
        if(buttonEl.classList[1]){
          gasPressed = true;
        }else{
          gasPressed = false;
        }
      }else if(id == "button-left-shoulder-bottom"){
        if(buttonEl.classList[1]){
          breakPressed = true;
        }else{
          breakPressed = false;
        }
      }
    }

    if (buttonEl) { // Extraneous buttons have just a label.
      if (pressed) {
        buttonEl.classList.add('pressed');
        var buttonId = id.substring(id.length-1);
        if(buttonId >= 1 && buttonId <= 4){
          if(method == 0)
            this.buttonPressed(buttonId);
          if(method == 2){
            var orientation = "";
            if(buttonId == 1){
              orientation = "forward";
              gasPressed = true;
            }else if(buttonId == 3){
              orientation = "backward";
              breakPressed = true;
            }
            socket.emit('move', orientation);
          }
        }
        if(buttonId == "m" && method == 1){
          var orientation = "";
          if(id == "button-left-shoulder-bottom"){
            //move backward
            orientation = "backward";
          }else if(id == "button-right-shoulder-bottom"){
            //move forward
            orientation = "forward";
          }
          socket.emit('move', orientation);
        }
      } else {
        if(method ==2){
        if(id == "button-1"){
          gasPressed = false;
        }else if(id == "button-1"){
          breakPressed = false;
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
  if(method == 0){  
      if(stickId == "stick-2" || stickId == "stick-1"){
          this.sendPos(value, horizontal);
      }
  }else if(method == 1 || method == 2){
      if(stickId == "stick-1"){
          this.sendRightOrLeft(value, horizontal);
      }
  }

    var gamepadEl = document.querySelector('#gamepad-' + gamepadId);

    // Update the stick visually.

    var stickEl = gamepadEl.querySelector('[name="' + stickId + '"]');
    if (stickEl) { // Extraneous sticks have just a label.
      var offsetVal = value * tester.STICK_OFFSET;

      if (horizontal) {
        stickEl.style.marginLeft = offsetVal + 'px';
      } else {
        stickEl.style.marginTop = offsetVal + 'px';
      }
    }
  },

  buttonPressed: function(id) {
    var orientation = [];
    switch(id){
      case "1": orientation = "backward"; break; //move down
      case "2": orientation = "right"; break; //move right
      case "3": orientation = "left"; break; //move left
      case "4": orientation = "forward"; break; //move up
    }
    socket.emit('move', orientation);
  },

  sendPos: function(value, horizontal){
    if(value>0.75 || value<-0.75){
        if(horizontal){
          //x
          nextStep.x = value;
          nextStep.y = 0;
        }else{
          //y
          nextStep.y = value;
          nextStep.x = 0;
        }

        this.move(nextStep);
      }
  },

  sendRightOrLeft: function(value, horizontal){
    if(gasPressed || breakPressed){
      if(value>0.75 || value<-0.75){
        if(horizontal){
          if(value > 0){
            //move right
            socket.emit('move', "right");
          }else{
            //move left
            socket.emit('move', "left");
          }
        }
      }
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
    socket.emit('move', orientation);
  }
};
