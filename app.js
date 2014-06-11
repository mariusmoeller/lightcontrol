
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var showRoute = require('./routes/show');
var pongRoute = require('./routes/pong');
var carRoute = require('./routes/car');
var controllerRoute = require('./routes/controller');
var http = require('http');
var path = require('path');
var socketio = require('socket.io');
var debug = require('debug')('app');
var sanitize = require('./src/sanitize');

var Light = require('./src/Light');
var MovingHead = require('./src/MovingHead');

// Set up command line arguments
var nconf = require('nconf');
var nconf = require('nconf');
nconf.argv({
        "a": {
            alias: 'address',
            describe: 'The IP Address of the artnet server'
        },
        "p": {
            alias: 'port',
            descirbe: 'Port of artnet server'
        }
    }).file({ file: './config/config.json' });

// Load artnet client with ip and port settings from command line
var Artnet = require('./src/ArtnetClient');
var artnetClient = new Artnet(nconf.get('address'), nconf.get('port'));
var movement = require('./src/movement');
var Show = require('./src/Show');

debug('start up');

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
app.get('/controller', controllerRoute.list);

debug('routes set up');

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

debug('server started');

var record = false;
var show = Show.createShow();

var washLight = new MovingHead(nconf.get('washs:0'), artnetClient);
washLight.turnOn();

socketio.listen(server).on('connection', function(socket) {
	socket.on('movement', function(data) {

        data = sanitize.movement(data);
        washLight.setPos(data[2], data[0]);

        debug('movement data send to artnet client, data: ' + data);

        if (record)
            show.addData(1, data);
	});

    socket.on('move', function(step) {

        // var data = movement.move(step);
        switch(step){
                                   // y, x
            case "forward":  washLight.move(0, 5);break;
            case "backward": washLight.move(0, -5);break;
            case "left":     washLight.move(-3, 0);break;
            case "right":    washLight.move(3, 0);break;
        }

        if (record)
            show.addData(1, data);
    });

    socket.on('color', function(hexColor) {
        // Cut off #, then convert string to base 16 number
        var num = parseInt(hexColor.substring(1), 16);

        washLight.setColor([num >> 16, num >> 8 & 255, num & 255])

        if (record)
            show.addData(2, [num >> 16, num >> 8 & 255, num & 255]);
    });

    socket.on('startShow', function(show) {
        debug("Pong started");
        var width = 100;
        var height = 100;

        var Pong = require('./src/Pong');

        var pong = new Pong(100, 100);

        setInterval(function() {
            var xPos = pong.getBallPos()[0] + 100;
            var yPos = pong.getBallPos()[1] + 100;

            washLight.setPos(yPos, xPos);

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
});
