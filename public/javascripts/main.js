function handleOrientation(event) {

	var iosocket = io.connect();

	var z = Math.floor(event.alpha);
	var x = Math.floor(event.beta);
	var y = Math.floor(event.gamma);
	
	document.getElementById("x").innerHTML = x;
	document.getElementById("y").innerHTML = y;
	
	iosocket.emit('data', x + " " + y + " " + z);
	
	console.log('orientation handler fires');
}

window.addEventListener('deviceorientation', handleOrientation);
