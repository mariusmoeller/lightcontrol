function handleOrientation(event) {

	var socket = io.connect();

	var z = event.alpha;
	var x = event.beta;
	var y = event.gamma;

	var orientation = [x, y, z];
	// var oriententation = ['0','0','0','0',x,'0',z];

	// document.getElementById("x").innerHTML = x;
	// document.getElementById("y").innerHTML = y;

	socket.emit('movement', orientation);
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
	});

	$('#btn-start-game').click(function() {
		var socket = io.connect();
		socket.emit('startShow');
	});

	$('#btn-record').click(function() {
		var socket = io.connect();
		if ($(this).hasClass('btn-default')) {
			$(this).addClass('btn-danger');
			socket.emit('record', true);
		} else {
			$(this).removeClass('btn-danger');
			socket.emit('record', false);
		}
		$(this).toggleClass('btn-default');
	});
}
