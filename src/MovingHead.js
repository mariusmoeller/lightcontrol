var Light = require('./Light');
var util = require('util');

function MovingHead() {
    Light.apply(this, Array.prototype.slice.call(arguments));
    this._super = Light.prototype;
    this.x = 0;
    this.z = 0;
}

MovingHead.prototype.setColor = function(hex) {
    Light.prototype.setColor.call(this, hex);
}

MovingHead.prototype.turnOn = function() {
    Light.prototype.turnOn.call(this);
}

MovingHead.prototype.setPos = function(x, z) {
    // Remember position
    this.x = x;
    this.z = z;

    var data = {};
    data[this.conf.pan.channel] = x;
    data[this.conf.tilt.channel] = z;

    this.artnet.send(data);
}

MovingHead.prototype.setSpot = function() {
    Light.prototype.setSpot.call(this);
}

MovingHead.prototype.setPosByDegrees = function(x, z) {
    var xConst = 255 / [this.conf.pan.max];
    var zConst = 255 / [this.conf.tilt.max];

    this.setPos(x * xConst, z * zConst);
}

MovingHead.prototype.move = function(x, z) {
    this.x += x;
    this.z += z;

    var data = {};
    data[this.conf.pan.channel] = this.x;
    data[this.conf.tilt.channel] = this.z;
    console.log("x: "+this.x+" y: "+this.y);

    this.artnet.send(data);
}

MovingHead.prototype.makeStep = function(direction) {
    switch(direction){
        case "forward":  this.z--;;break;
        case "backward": this.z++;break;
        case "left":     this.x--;break;
        case "right":    this.x++;break;
    }

    if(this.z > 255){
        this.z = 255;
    }else if(this.z < 0){
        this.z = 0;
    }else if(this.x > 255){
        this.x = 255;
    }else if(this.x < 0){
        this.x = 0;
    }

    var data = {};
    data[this.conf.pan.channel] = this.x;
    data[this.conf.tilt.channel] = this.z;
    console.log("x: "+this.x+" y: "+this.z);

    this.artnet.send(data);
}

MovingHead.prototype.setPosDelayed = function(x, y, delay) {
    var i = 0;

    var thisContext = this;
    var timer = setInterval(function() {
        // TODO: Actually terminate timer accurately not just guess
        if (i < x.length) {
            thisContext.setPos(x[i], y[i]);
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
