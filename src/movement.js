var move = function(direction) {
    var pos = [];
    switch(direction){
                               // y, x
        case "forward":  pos = {"y":0};break;
        case "backward": pos = {"y":255};break;
        case "left":     pos = {"x":128};break;
        case "right":    pos = {"x":200};break;
    }

    return pos;
}

exports.move = move;