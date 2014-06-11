function Pong(width, height, players) {
    this.width = width;
    this.height = height;

    this.ballX = parseInt(width / 2)
    this.ballY = parseInt(height / 2)
    this.ballSpeed = 5;

    this.ballXSpeed = 2;
    this.ballYSpeed = 1;

    this.players = players;
}

Pong.prototype.makeStep = function() {
    this.ballX += this.ballXSpeed;
    this.ballY += this.ballYSpeed;

    // Ball hits wall on the side
    if (this.ballX <= 0 || this.ballX >= this.width) {
        // this.ballXSpeed = -this.ballXSpeed + Math.floor(Math.random() * (5 - 5) + 5);
        this.ballXSpeed = -this.ballXSpeed;

    }

    // Ball reaches end of field
    if (this.ballY <= 0 || this.ballY >= this.height) {
        // TODO: hit players and reflect or loose

        // this.ballYSpeed = -this.ballYSpeed + Math.floor(Math.random() * (5 - 5) + 5);
        this.ballYSpeed = -this.ballYSpeed;
    }
}

Pong.prototype.getBallPos = function() {
    return [this.ballX, this.ballY];
}

Pong.prototype.updatePlayers = function(players) {
    this.players = players;
}

module.exports = Pong;
