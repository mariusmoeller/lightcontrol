
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

    if (padsConnected) {
      document.querySelector('#no-gamepads-connected').classList.remove('visible');
    } else {
      document.querySelector('#no-gamepads-connected').classList.add('visible');
    }
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
    if (buttonEl) { // Extraneous buttons have just a label.
      if (pressed) {
        buttonEl.classList.add('pressed');
        var buttonId = id.substring(id.length-1);
        if(buttonId >= 1 && buttonId <= 4){
          this.buttonPressed(buttonId);
        }
      } else {
        buttonEl.classList.remove('pressed');
      }
    }
  },

  /**
   * Update a given analogue stick on the screen.
   */
  updateAxis: function(value, gamepadId, labelId, stickId, horizontal) {
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
      case 1: orientation = [0,-255,0]; break; //move down
      case 2: orientation = [255,0,0]; break; //move right
      case 3: orientation = [-255,0,0]; break; //move left
      case 4: orientation = [0,255,0]; break; //move up
    }
  }
};