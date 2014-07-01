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

MovingHead.prototype.setPos = function(pan, tilt) {
    // Remember position
    this.pan = pan;
    this.tilt = tilt;

    var data = {};
    data[this.conf.pan.channel] = pan;
    data[this.conf.tilt.channel] = tilt;

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

    var data = {};
    data[this.conf.tilt.channel] = this.tilt;
    data[this.conf.pan.channel] = this.pan;

    console.log("pan: " + this.pan + " til: " + this.tilt);

    this.artnet.send(data);
}

MovingHead.prototype.makeStep = function(direction) {
    switch(direction){
        case "forward":  this.z--;;break;
        case "backward": this.z++;break;
        case "left":     this.x--;break;
        case "right":    this.x++;break;
    }

    var data = {};
    data[this.conf.tilt.channel] = this.x;
    data[this.conf.pan.channel] = this.z;
    console.log("x: "+this.x+" y: "+this.z);

    this.artnet.send(data);
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
