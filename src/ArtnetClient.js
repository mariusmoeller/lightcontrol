var artnet = require('artnet-node/lib/artnet_client');

function ArtnetClient(ip, port) {
    this.artnetClient = artnet.createClient(ip, port);
    this.data = [];
}

ArtnetClient.prototype.send = function(dataObject) {
    for (k in dataObject) {
        this.data[k] = dataObject[k];
    }

    this.artnetClient.send(this.data);
}

module.exports = ArtnetClient;
