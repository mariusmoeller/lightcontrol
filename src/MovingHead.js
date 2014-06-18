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
    // this.x = x;
    // this.z = z;

    var data = {};
    data[this.conf.pan.channel] = x;
    data[this.conf.tilt.channel] = z;
    // console.log(this.artnet);
    console.log(data);
    this.artnet.send(data);
}

MovingHead.prototype.move = function(x, z) {
    this.x += x;
    this.z += z;

    var data = {};
    data[this.conf.pan.channel] = this.x;
    data[this.conf.tilt.channel] = this.z;

    this.artnet.send(data);
}

module.exports = MovingHead;
