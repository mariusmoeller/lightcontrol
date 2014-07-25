
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
var timerRoute = require('./routes/timer');
var http = require('http');
var path = require('path');
var socketio = require('socket.io');
var debug = require('debug')('app');
var sanitize = require('./src/sanitize');
var _ = require('lodash-node');

// Load configuration and command line arguments
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

app.use(function(req, res, next){
   res.locals.devices = devices;
   next();
});

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
app.get('/timer', timerRoute.list);

app.get('/conf', function(req, res) {res.render('conf')});
app.get('/draw', function(req, res) {res.render('draw')});

// API
app.get('/devices', function(req, res) {
    res.json(nconf.get('devices'));
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// Load artnet client
var Artnet = require('./src/ArtnetClient');
var artnetClient = new Artnet(nconf.get('address'), nconf.get('port'));

// Load device classes
var Devices = {};
require("fs").readdirSync("./src/devices").forEach(function(file) {
  Devices[file.substr(0, file.length-3)] = require("./src/devices/" + file);
});

// Set up configured devices
var devices = nconf.get('devices');
_(devices).forEach(function(device, i) {
    devices[i] = new Devices[device.type](device, artnetClient);
});

// Misc
var Show = require('./src/Show');

var record = false;
var show = Show.createShow();

// TODO: Put this somewhere else. Maybe turn everything on at start or better
// save status in config and then send when server starts
devices[0].turnOn();

// TODO: Change to streaming socketio for improved performance
// Listen to socketio connections
socketio.listen(server).on('connection', function(socket) {
    socket.on('setPosByDegrees', function(degrees) {
        debug('setPosByDegrees: ' + degrees.toString());

        devices[0].setPosByDegrees(degrees[0], degrees[1]);
    })

    socket.on('movement', function(data, id) {

        debug('movement data send to artnet client, data: ' + data);

        // data = sanitize.movement(data);
        // devices[0].setPos(data[2], data[0]);

        devices[0].setPosByDegrees(360 - data['alpha'], data['beta'] + 90)

        if (record)
            show.addData(1, data);
    });

    socket.on('pong', function(options) {
        console.log("pong: " +options);
        socket.broadcast.emit('pong', options);
    });

    socket.on('pongScore', function(player) {
        console.log("player " + player + " scored");
        socket.broadcast.emit('pongScore', player);
    });

    socket.on('move', function(data, id) {
        devices[id].move(data.z, data.x);
    });

    socket.on('setPos', function(data, id) {
        devices[id].setPos(data[0], data[1]);
    })

    socket.on('color', function(hexColor, id) {
        debug('Recieved color data: ' + hexColor);
        if (typeof id == 'undefined')
            id = 0;

        // Cut off #, then convert string to base 16 number
        var num = parseInt(hexColor.substring(1), 16);

        devices[id].setColor([num >> 16, num >> 8 & 255, num & 255])

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

            devices[0].setPos(yPos, xPos);

            pong.makeStep()
        }, 10);
    })

    // TODO: Make own event or path for draw
    socket.on('record', function(xData, yData) {
        _(yData).forEach(function(value, i) {
            yData[i] = sanitize.movement([0,0, value])[2];
        })

        devices[0].setPosDelayed(xData, yData, 40);
    })

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
    socket.on('direct', function(data) {
        console.log(data);
        artnetClient.send(data);
    });

    socket.on("timer",function(colorArray){
        var counter = 0;

        var i = setInterval(function() {
             var hexColor = colorArray[counter];

             var num = parseInt(hexColor.substring(1), 16);

            devices[0].setColor([num >> 16, num >> 8 & 255, num & 255])

            console.log(num);

            counter++;

            if(counter == colorArray.length)
                clearInterval(i);

        }, 1000);

    });
});
