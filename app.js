
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
var _ = require('lodash-node');

// Set up configuration and command line arguments
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

// Set up express
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

app.get('/conf', function(req,res) {res.render('conf')});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// Load artnet client
var Artnet = require('./src/ArtnetClient');
var artnetClient = new Artnet(nconf.get('address'), nconf.get('port'));

// Set up lights
var Light = require('./src/Light');
var MovingHead = require('./src/MovingHead');

var washs = nconf.get('washs');
_(washs).forEach(function(wash, i) {
    washs[i] = new MovingHead(wash, artnetClient);
});

// Misc
var movement = require('./src/movement');
var Show = require('./src/Show');

var record = false;
var show = Show.createShow();

// TODO: remove legacy light
var washLight = new MovingHead(nconf.get('washs:0'), artnetClient);
washLight.turnOn();

// Listen to socketio connections
socketio.listen(server).on('connection', function(socket) {
	socket.on('movement', function(data, lightID) {

        data = sanitize.movement(data);
        washs[lightID].setPos(data[2], data[0]);

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

    socket.on('color', function(hexColor, lightID) {
        debug('Recieved color data: ' + hexColor);

        // Cut off #, then convert string to base 16 number
        var num = parseInt(hexColor.substring(1), 16);

        washs[lightID].setColor([num >> 16, num >> 8 & 255, num & 255])

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

    socket.on('record', function() {
        var xData = [];
        var yData = [];

        for (var i = 0; i < 200; i++) {
            if (i < 50) {
                xData[i] = 1
                yData[i] = 0
            } else if (i < 100) {
                xData[i] = 0
                yData[i] = 1
            } else if (i < 150) {
                xData[i] = -1
                yData[i] = 0
            } else if (i < 200) {
                xData[i] = 0
                yData[i] = -1
            }
        }

        sendDataDelayed(xData, yData, 20);
        console.log(washs[0]);
    })

    // TODO: Move this to somewhere
    var sendDataDelayed = function(x, y, delay) {
        var i = 0;

        var timer = setInterval(function() {
            // TODO: Actually terminate timer not just let it running
            if (i < 400) {
                washs[0].move(x[i], y[i]);
                i++;
                console.log(x[i] + " y: " + y[i]);
            } else {
                clearInterval(timer);
            }
            console.log("times is running");
        }, delay);

        setTimeout(function() {
            clearInterval(timer);
        }, delay * y.length + 100);
    }

    socket.on('direct', function(data) {
        debug('Data send: ' = data);
        artnetClient.send(data);
    });
    // socket.on('record', function(state) {
    //     console.log(state);
    //
    //     if (state) {
    //         record = state;
    //     } else {
    //         record = state
    //         //console.log(show.getAll())
    //         show.save();
    //         show.deleteAll()
    //     }
    // })
});
