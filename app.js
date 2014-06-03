
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var showRoute = require('./routes/show');
var http = require('http');
var path = require('path');
var socketio = require('socket.io');
// var artnet = require('artnet-node/lib/artnet_client');
var Artnet = require('./src/ArtnetClient');
var artnetClient = new Artnet(process.argv[3], process.argv[5]);

var Show = require('./src/Show');
var debug = require('debug')('app');

var sanitize = require('./src/sanitize');

debug('start up');
// print process.argv
/*process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});*/

// var artnetClient = artnet.createClient(process.argv[3], process.argv[5]);

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/shows', showRoute.list);

debug('routes set up');

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

debug('server started');

var record = false;
var show = Show.createShow();

socketio.listen(server).on('connection', function(socket) {
	socket.on('data', function(data) {

        debug('movement data comes in' + data);

        data = sanitize.movement(data);

        var movementData = {4: data[2], 6: data[0]};

    	// send to artnet server
    	artnetClient.send(movementData);

        debug('movement data send to artnet client, data: ' + data);

        if (record)
            show.addData(1, data);

		console.log(data);
	});

    socket.on('color', function(data) {
        // cut off #, then convert string to base 16 number
        var num = parseInt(data.substring(1), 16);

        // return the red, green and blue values as a new array
        // console.log([num >> 16, num >> 8 & 255, num & 255]);

        var channelData = {};
        // var channelData = {NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,num >> 16,num >> 8 & 255, num & 255,32,255};
        channelData[8] = num >> 16;
        channelData[9] = num >> 8 & 255;
        channelData[10] = num & 255;
        channelData[11] = 32;
        channelData[12] = 255;
        console.log(channelData);

        // send to artnet server
        artnetClient.send(channelData);

        if (record)
            show.addData(2, [num >> 16, num >> 8 & 255, num & 255]);
    })

    socket.on('record', function(state) {
        console.log(state);
        if (state)
            record = state;
        else
            record = state
            //console.log(show.getAll())
            show.save();
            show.deleteAll()
    })

    // socket.on('')
});
