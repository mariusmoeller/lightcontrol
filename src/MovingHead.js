var Light = require('./Light');
var util = require('util');

function MovingHead() {
    Light.apply(this, Array.prototype.slice.call(arguments));
    this._super = Light.prototype;
}

MovingHead.prototype.setColor = function(hex) {
    Light.prototype.setColor.call(this, hex);
}

MovingHead.prototype.turnOn = function() {
    Light.prototype.turnOn.call(this);
}

MovingHead.prototype.setPos = function(x, z) {
    var data = {};
    data[this.conf.pan.channel] = x;
    data[this.conf.tilt.channel] = z;

    this.artnet.send(data);
}

module.exports = MovingHead;