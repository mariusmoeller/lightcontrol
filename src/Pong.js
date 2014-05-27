function Pong(width, height) {
    this.width = width;
    this.height = height;

    this.ballX = parseInt(width / 2)
    this.ballY = parseInt(height / 2)
    this.ballSpeed = 10

    this.ballXSpeed = 1;
    this.ballYSpeed = 1;

    this.playerAx1;
    this.playerAx2;

    this.playerBx1;
    this.playerBx2;
}

Pong.prototype.makeStep = function() {
    this.ballX += this.ballXSpeed;
    this.ballY += this.ballYSpeed;

    // Ball hits wall on the side
    if (this.ballX <= 0 || this.ballX >= this.width) {
        this.ballXSpeed = -this.ballXSpeed;
    }

    if (this.ballY <= 0 || this.ballY >= this.height) {
        this.ballYSpeed = -this.ballYSpeed;
    }
}

Pong.prototype.getBallPos = function() {
    return [this.ballX, this.ballY];
}

Pong.prototype.setPlayerAPosition = function(x1, x2) {
    this.playerAx1 = x1;
    this.playerAx2 = x2;
}

Pong.prototype.setPlayerBPosition = function(x1, x2) {
    this.playerBx1 = x1;
    this.playerBx2 = x2;
}


module.exports = Pong;
