function Light(conf, artnetClient) {
    this.conf = conf;
    this.artnet = artnetClient;
}

Light.prototype.setColor = function(rgb) {
    var data = {};
    data[this.conf.r.channel] = rgb[0];
    data[this.conf.g.channel] = rgb[1];
    data[this.conf.b.channel] = rgb[2];

    // console.log(data)
    this.artnet.send(data);
}

Light.prototype.turnOn = function() {
    var data = {};
    data[this.conf.on.channel] = this.conf.on.value;
    data[this.conf.intensity.channel] = 255;
    this.artnet.send(data);
}

Light.prototype.setSpot = function() {
    var data = {};
    data[this.conf.iris.channel] = this.conf.iris.value;
    data[this.conf.focus.channel] = this.conf.focus.value;
        this.artnet.send(data);
}

Light.prototype.turnOff = function() {
    var data = {};
    data[this.conf.off.channel] = this.conf.off.value;
}

module.exports = Light;
