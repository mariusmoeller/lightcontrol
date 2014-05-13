// var Show = {};

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

Show.prototype.deleteAll = function() {
    this.data = [];
}
