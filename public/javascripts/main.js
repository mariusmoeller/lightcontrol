function handleOrientation(event) {

	var socket = io.connect();

	var z = event.alpha;
	var x = event.beta;
	var y = event.gamma;
	
	var orientation = [x, y, z];
	
	document.getElementById("x").innerHTML = x;
	document.getElementById("y").innerHTML = y;
	
	socket.emit('data', orientation);
}

window.addEventListener('deviceorientation', handleOrientation);
