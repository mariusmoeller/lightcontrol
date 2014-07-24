var Light = require('./Light');
var util = require('util');

function MovingHead() {
    Light.apply(this, Array.prototype.slice.call(arguments));
    this._super = Light.prototype;
    this.pan = 0;
    this.tilt = 0;
}

MovingHead.prototype.setColor = function(hex) {
    Light.prototype.setColor.call(this, hex);
}

MovingHead.prototype.turnOn = function() {
    Light.prototype.turnOn.call(this);
}

var limitRange = function(value) {
    if (value < 0) {
        return 0;
    } else if (value > 255) {
        return 255;
    } else {
        return value;
    }
}

MovingHead.prototype.setSpot = function() {
    Light.prototype.setSpot.call(this);
}

MovingHead.prototype.setPos = function(pan, tilt) {
    // Remember position
    this.pan = pan;
    this.tilt = tilt;

    var data = {};
    data[this.conf.pan.channel] = limitRange(pan);
    data[this.conf.tilt.channel] = limitRange(tilt);
    console.log(data);

    this.artnet.send(data);
}

MovingHead.prototype.setPosByDegrees = function(pan, tilt) {
    var tiltConst = 255 / [this.conf.tilt.max];
    var panConst = 255 / [this.conf.pan.max];

    this.setPos(Math.round(pan * panConst), Math.round(tilt * tiltConst));
}


MovingHead.prototype.move = function(pan, tilt) {
    this.pan += pan;
    this.tilt += tilt;

    this.setPos(this.pan, this.tilt);
}

MovingHead.prototype.setPosDelayed = function(pan, tilt, delay) {
    var i = 0;

    var thisContext = this;
    var timer = setInterval(function() {
        // TODO: Actually terminate timer accurately not just guess
        if (i < x.length) {
            thisContext.setPos(pan[i], tilt[i]);
            i++;
        } else {
            // This would be clear termination, doesen't seem to work though
            // because timer variable is probably not available here
            clearInterval(timer);
        }
    }, delay);

    setTimeout(function() {
        clearInterval(timer);
    }, delay * x.length + 100);
}

module.exports = MovingHead;