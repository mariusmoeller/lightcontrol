function handleOrientation(event) {

	var socket = io.connect();

	var z = event.alpha;
	var x = event.beta;
	var y = event.gamma;

	var orientation = [x, y, z];
	// var oriententation = ['0','0','0','0',x,'0',z];

	// document.getElementById("x").innerHTML = x;
	// document.getElementById("y").innerHTML = y;

	// TODO: send proper light id
	socket.emit('movement', orientation, 0);
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

			// TODO: send proper light id
			socket.emit('color', hex, 0);
			//console.log(hex + ' - ' + opacity);
		}
	});

	$('#colors').minicolors();

// Startfarbe

	$('#colorsStart').minicolors({

		change: function(hex, opacity) {

			// hex zu HSL

			var color = hexToHsl(hex);
			//console.log(color);
/*
			var color2 = hexToRgb(hex);
			console.log(color2);


			var color3 = rgbToHsv(color2);
			console.log(color3);
			*/

			startColor = color;
		}
	});

	$('#colorsStart').minicolors();

// Endfarbe

	$('#colorsEnd').minicolors({
		change: function(hex, opacity) {
			

			// hex zu HSL

			var color = hexToHsl(hex);
			//console.log(color);
			
			endColor = color;

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
		// var socket = io.connect();
		// socket.emit('startShow');
	});

	$('#btn-send-dmx').click(function() {
		var data = {}
		var channel = $('#dmx-channel');
		var value = $('#dmx-value');

		data[channel] = value;

		var socket = io.connect();
		socket.emit('direct', data);
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
		var socket = io.connect();
		socket.emit('record', xData, yData);
		// xData = [];
		// yData = [];

	});

	 $( ".thumbnail" )
	        .click(function() {
	            $(this).find('.caption').removeClass("slideOutLeft").addClass("slideInLeft").show();
	            $('.disabled').show();
	});

	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		$('#btn-send-position').show();
	}else{
		$('#btn-send-position').hide();
	}
}
