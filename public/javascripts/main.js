function handleOrientation(event) {

	var iosocket = io.connect();

	var x = event.beta;
	var y = event.gamma;
	
	document.getElementById("x").innerHTML = x;
	document.getElementById("y").innerHTML = y;
	
	iosocket.emit('data', x + " " + y);
	
	console.log('orientation handler fires');
}

window.addEventListener('deviceorientation', handleOrientation);
