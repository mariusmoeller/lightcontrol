
for (var i = 0; i < 512; i++) {
    $('<input id="dmx-slider-' + i +'" data-channel="' + i +'" type="range" min="0" max="255" value="0">')
        .on({
            input: function(event) {
                var socket = io.connect();

                var data = {}
                var channel = $(event.target).data("channel");
                var value = event.target.value;

                data[channel] = value;

                console.log(data);

                var socket = io.connect();
                socket.emit('direct', data);
            }
        })
        .appendTo('#sliders');
}
