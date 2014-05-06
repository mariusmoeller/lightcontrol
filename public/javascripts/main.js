function handleOrientation(event) {

	var x = event.beta;
	var y = event.gamma;
	
	document.getElementById("x").innerHTML = x;
	document.getElementById("y").innerHTML = y;
	
	console.log('orientation handler fires');
}

window.addEventListener('deviceorientation', handleOrientation);
