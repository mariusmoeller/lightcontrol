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

exports.movement = movement;
