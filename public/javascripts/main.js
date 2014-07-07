function handleOrientation(event) {
	// var x = event.beta;
	// var y = event.gamma;
	// var z = event.alpha;

	// var orientation = [event.alpha, event.beta, event.gamma];

	var orientation = {};
	orientation['alpha'] = event.alpha;
	orientation['beta'] = event.beta;
	orientation['gamma'] = event.gamma;


	document.getElementById("alpha").innerHTML = event.alpha;
	document.getElementById("beta").innerHTML = event.beta;
	document.getElementById("gamma").innerHTML = event.gamma;

	socket.emit('movement', orientation, 0);
}


window.onload = function() {
	// TODO: remove global
	socket = io.connect();

	$.minicolors.defaults = $.extend($.minicolors.defaults, {
		changeDelay: 0,
		letterCase: 'uppercase',
		theme: 'wheel',
		inline: true,
		control: 'wheel'
	});

	$('#colors').minicolors({
		change: function(hex, opacity) {
			// TODO: send proper light id
			socket.emit('color', hex, 0);
			//console.log(hex + ' - ' + opacity);
		}
	});

	$('#colors').minicolors();


	$('#colorsStart').minicolors({
		change: function(hex, opacity) {

			// hex zu HSL

			var color = hexToHsl(hex);

			startColor = color;

			//console.log(color);		
			//timeProgression();
			
		}
	});

	$('#colorsStart').minicolors();






	$('#colorsEnd').minicolors({
		change: function(hex, opacity) {
			

			// hex zu HSL

			var color = hexToHsl(hex);
			
			endColor = color;


/*
			console.log(color);
			console.log(color2);*/

			//timeProgression();			



			//console.log(farbe);

		}
	});

	$('#colorsEnd').minicolors();

		

	$('#btn-send-position').click(function() {
		if ($('#btn-send-position').hasClass('btn-success'))
			window.removeEventListener('deviceorientation', handleOrientation);
		else
			window.addEventListener('deviceorientation', handleOrientation);

		$(this).toggleClass('btn-success');
	});

	$('#btn-start-game').click(function() {
		socket.emit('startShow');
	});

	$('#btn-send-dmx').click(function() {
		var data = {}
		var channel = $('#dmx-channel');
		var value = $('#dmx-value');

		data[channel] = value;

		socket.emit('direct', data);
	});

	$('#btn-record').click(function() {
		if ($(this).hasClass('btn-default')) {
			$(this).addClass('btn-danger');
			socket.emit('record', true);
		} else {
			$(this).removeClass('btn-danger');
			socket.emit('record', false);
		}
		$(this).toggleClass('btn-default');
	});

	if ($('#drawing-board').length) {
		var width = 200;
		var height = 50;

		// TODO: remove globals
		xData = [];
		yData = [];

		for (var y = width; y > 0; y -= 4) {
			$("<tr></tr>").attr('id', 'row-' + y).appendTo("#drawing-board");
			for (var x = 0; x < height; x++) {
				$( "<td></td>" )
					.addClass( "div-pos" )
					.data('x', x)
					.data('y', y)
					.on({
				    	click: function( event ) {
				      	// Do something
						    console.log($(this).data('x'));
							console.log($(this).data('y'));
							swapColor(this);
							xData.push($(this).data('x'));
							yData.push($(this).data('y'));
						},
						mouseenter: function(event) {
							// If mouse button is pressed
							if (event.which == 1) {
								swapColor(this);
								xData.push($(this).data('x'));
								yData.push($(this).data('y'));
							}
							// console.log(event.which);
						}

				}).appendTo("#row-" + y);
			}
		}

		var swapColor = function(self) {
			self.style.backgroundColor = 'white';
		}
	}
	$('#btn-send-data').click(function() {
		socket.emit('record', xData, yData);
		// xData = [];
		// yData = [];

	})
}
