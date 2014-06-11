var move = function(direction) {
    var pos = [];
    switch(direction){
                               // y, x
        case "forward":  pos = {"y": -1};break;
        case "backward": pos = {"y": 1};break;
        case "left":     pos = {"x":-1};break;
        case "right":    pos = {"x": 1};break;
    }

    return pos;
}

exports.move = move;
