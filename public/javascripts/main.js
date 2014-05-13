function handleOrientation(event) {

	var socket = io.connect();

	var z = event.alpha;
	var x = event.beta;
	var y = event.gamma;

	var orientation = [x, y, z];

	// document.getElementById("x").innerHTML = x;
	// document.getElementById("y").innerHTML = y;

	socket.emit('data', orientation);
}


window.onload = function() {
	$.minicolors.defaults = $.extend($.minicolors.defaults, {
		changeDelay: 0,
		letterCase: 'uppercase',
		theme: 'wheel',
		inline: true,
		control: 'wheel'
	});

	$('#colors').minicolors({
		change: function(hex, opacity) {
			var socket = io.connect();

			socket.emit('color', hex);
			// console.log(hex + ' - ' + opacity);
		}
	});

	$('#colors').minicolors();

	$('#timer').click(function(){timer();});

	$('#btn-send-position').click(function() {
		if ($('#btn-send-position').hasClass('btn-success'))
			window.removeEventListener('deviceorientation', handleOrientation);
		else
			window.addEventListener('deviceorientation', handleOrientation);

		$(this).toggleClass('btn-success');
	})
}
