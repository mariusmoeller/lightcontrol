
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var showRoute = require('./routes/show');
var pongRoute = require('./routes/pong');
var carRoute = require('./routes/car');
var http = require('http');
var path = require('path');
var socketio = require('socket.io');
var debug = require('debug')('app');
var sanitize = require('./src/sanitize');

var nconf = require('nconf');
nconf.file({ file: './config/config.json' });

// nconf.set('washs:0:r:channel', 8);
// nconf.set('washs:0:g:channel', 9);
// nconf.set('washs:0:b:channel', 10);
// nconf.set('washs:0:on:channel', 11);
// nconf.set('washs:0:on:value', 32);
// nconf.set('washs:0:pan:channel', 4);
// nconf.set('washs:0:tilt:channel', 6);
// nconf.save();


// Load artnet client with ip and port settings from command line
var Artnet = require('./src/ArtnetClient');
var artnetClient = new Artnet(process.argv[3], process.argv[5]);

var Show = require('./src/Show');

debug('start up');

// print process.argv
/*process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});*/

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
app.get('/pong', pongRoute.list);
app.get('/car', carRoute.list);

debug('routes set up');

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

debug('server started');

var record = false;
var show = Show.createShow();

socketio.listen(server).on('connection', function(socket) {
	socket.on('movement', function(data) {
        var wash = nconf.get('washs:0');

        // console.log(wash);
        debug('movement data comes in' + data);

        data = sanitize.movement(data);

        var movementData = {};
        movementData[wash.pan.channel] = data[2];
        movementData[wash.tilt.channel] = data[0];

        console.log(wash);

    	// send to artnet server
    	artnetClient.send(movementData);

        debug('movement data send to artnet client, data: ' + data);

        if (record)
            show.addData(1, data);

		console.log(data);
	});

    socket.on('color', function(hexColor) {
        var wash = nconf.get('washs:0');

        // cut off #, then convert string to base 16 number
        var num = parseInt(hexColor.substring(1), 16);

        var channelData = {};
        channelData[wash.r.channel] = num >> 16;
        channelData[wash.g.channel] = num >> 8 & 255;
        channelData[wash.b.channel] = num & 255;
        channelData[wash.on.channel] = wash.on.value;
        channelData[12] = 255;

        // send to artnet server
        artnetClient.send(channelData);

        if (record)
            show.addData(2, [num >> 16, num >> 8 & 255, num & 255]);
    })

    socket.on('startShow', function(show) {
        debug("Pong started");
        var width = 100;
        var height = 100;

        var Pong = require('./src/Pong');

        var pong = new Pong(100, 100);

        setInterval(function() {
            var xPos = pong.getBallPos()[0];
            var yPos = pong.getBallPos()[1];

            var movementData = {4: yPos, 6: xPos};

            artnetClient.send(movementData);


            pong.makeStep()

        }, 10);
    })

    socket.on('record', function(state) {
        /*console.log(state);
        if (state)
            record = state;
        else
            record = state
            //console.log(show.getAll())
            show.save();
            show.deleteAll()*/


        /*var i;
        artnetClient.send({4: 0, 6: 0});

        var interval = setInterval(function() {
            artnetClient.send({4: 0, 6: i});
            i++;
            if (i < width)
                clearInterval(interval);
        }, 100);

        /*for (var i = height; i < height; i++) {
            artnetClient.send({4: i, 6: width});
        }

        for (var i = width; i < width; i++) {
            artnetClient.send({4: 0, 6: i});
        }

        for (var i = height; i < height; i++) {
            artnetClient.send({4: i, 6: width});
        }*/


        /*for (var i = 0; i < 100; i++) {
            var xPos = pong.getBallPos()[0];
            var yPos = pong.getBallPos()[1];

            pong.makeStep()



            // console.log(pong.getBallPos());

        }*/


    })

    // socket.on('')
});
