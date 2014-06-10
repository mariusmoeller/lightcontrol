var move = function(direction) {
    var pos = [];
    switch(direction){
                               // y, x
        case "forward":  pos = [0,0];break;
        case "backward": pos = [255,0];break;
        case "left":     pos = [128,56];break;
        case "right":    pos = [128,128];break;
    }
    
    return pos;
}

exports.move = move;
