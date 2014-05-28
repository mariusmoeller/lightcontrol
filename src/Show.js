// var Show = {};
var fs = require('fs');

function Show(data) {
    this.data = [];
}

exports.createShow = function() {
    return new Show();
}

Show.prototype.addData = function(channel, value) {
    this.data.push([Date.now(), channel, value]);
}

Show.prototype.getData = function(id) {
    return this.data[id];
}

Show.prototype.getAll = function() {
    return this.data;
}

Show.prototype.save = function() {
    fs.writeFileSync('./store/show', this.data.join('\n'));
}

Show.prototype.deleteAll = function() {
    this.data = [];
}
