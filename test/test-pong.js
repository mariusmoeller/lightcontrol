var Pong = require('../src/Pong');

var pong = new Pong(80, 20);

for (var i = 0; i < 100; i++) {
    var xPos = pong.getBallPos()[0];
    var yPos = pong.getBallPos()[1];

    var line = '';

    for (var y = 0; y < 20; y++) {
        for (var x = 0; x < 80; x++) {
            if (xPos == x && yPos == y) {
                line = line.concat("X");
            } else {
                line = line.concat(" ");
            }
        }

        console.log(line);
        line = '';
    }

    pong.makeStep()





    // console.log(pong.getBallPos());

}
