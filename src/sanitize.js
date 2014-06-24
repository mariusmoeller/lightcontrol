var movement = function(pos) {
    // x from +90 to -90
    var x = pos[0];
    var y = pos[1];
    var z = pos[2];

    x += 90;
    x = Math.floor(x * 1.4);

    y += 90;
    y = Math.floor(y * 0.7);


    z = Math.abs(360 - z);

    // 0 = 0 degree, 255 = 630 degree, 540 / 360 = 1.5
    z *= 1.15;

    // if (z > 360)
        // z -= 360;

    // z * 0.7 -> normalise to 0 - 255
    // Math.abs(z-360) -> turn direction
    // z = Math.abs(z - 360);

    // mapping to 0-255
    z = Math.floor(z / 2.15);


    return [x,y,z];
}

var vectorCalc = function(xN,yN,zN){

        var alpha=acos( (xC*xN+yC*yN)/sqrt(pow(xN,2)+pow(yN,2))*sqrt(pow(xC,2)+pow(yC,2)));
        if(alpha <0){
                alpha += 360;
        }
        if(alpha > 540){
                alpha -= 360;
        }

        momentaneDrehBits = momentaneDrehBits+ floor (alpha/2,109375+0,5);
        var xZ = xC*cos(alpha)-yC*sin(alpha);
        var yZ = xC*sin(alpha)+yC*cos(alpha);
        var beta = acos((xN*xZ+yN+yZ*zN+zZ)/(sqrt(pow(xZ,2)+pow(yZ,2)+pow(zZ,2))*sqrt(pow(xN,2)+pow(yN,2)+pow(zN,2))));

        if(beta <0){
                beta += 180;
        }
        momentaneNeigungsBits = floor (beta/0,703125+0.5);

        return [momentaneDrehBits, momentaneNeigungsBits];
}

exports.movement = movement;
