var startColor = {};
var endColor = {};

function timer() {
    $('.countdownControl').click(function (event) {
            var text = $(".countdownControl").text();
            if (text === "Start") {
                 var hours = $('.knob.hour').val();
                 var minutes = $('.knob.minute').val();
                 var seconds = $('.knob.second').val();
                 timeProgression();

                var t = moment().add({
                        hours:$('.knob.hour').val(),
                        minutes:$('.knob.minute').val(),
                        seconds:$('.knob.second').val()
                });
                $(".ccounter").ccountdown(
                    t.year(),
                    t.month()+1,
                    t.date(),
                    t.hour()+":"+t.minutes()+":"+t.seconds()
                );
                
                $(".countdownControl").text("Reset");
            } else if (text === "Reset") {
                window.location.reload();
            }
        })

        $('.hideCountdown').click(function(){
            $('.ccounter').remove();
        });

        $(".knob").knob({
            draw: function () {

                var a = this.angle(this.cv), // Angle
                    sa = this.startAngle, // Previous start angle
                    sat = this.startAngle, // Start angle
                    ea, // Previous end angle
                    eat = sat + a, // End angle
                    r = true;

                this.g.lineWidth = this.lineWidth;

                this.o.cursor && (sat = eat - 0.3) && (eat = eat + 0.3);

                if (this.o.displayPrevious) {
                    ea = this.startAngle + this.angle(this.value);
                    this.o.cursor && (sa = ea + 0.3) && (ea = ea - 0.3);
                    this.g.beginPath();
                    this.g.strokeStyle = this.previousColor;
                    this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sa, ea, false);
                    this.g.stroke();
                }

                this.g.beginPath();
                this.g.strokeStyle = r ? this.o.fgColor : this.fgColor;
                this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sat, eat, false);
                this.g.stroke();

                this.g.lineWidth = 2;
                this.g.beginPath();
                this.g.strokeStyle = this.o.fgColor;
                this.g.arc(this.xy, this.xy, this.radius - this.lineWidth + 1 + this.lineWidth * 2 / 3, 0, 2 * Math.PI, false);
                this.g.stroke();

                return false;
            }
        });

        // Example of infinite knob, iPod click wheel
        var v, up = 0,
            down = 0,
            i = 0,
            $idir = $("div.idir"),
            $ival = $("div.ival"),
            incr = function () {
                i++;
                $idir.show().html("+").fadeOut();
                $ival.html(i);
            },
            decr = function () {
                i--;
                $idir.show().html("-").fadeOut();
                $ival.html(i);
            };
        $("input.infinite").knob({
            min: 0,
            max: 20,
            stopper: false,
            change: function () {
                if (v > this.cv) {
                    if (up) {
                        decr();
                        up = 0;
                    } else {
                        up = 1;
                        down = 0;
                    }
                } else {
                    if (v < this.cv) {
                        if (down) {
                            incr();
                            down = 0;
                        } else {
                            down = 1;
                            up = 0;
                        }
                    }
                }
                v = this.cv;
            }
        });
}


function hexToRgb(hex) {
   var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
   return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
} : null;
}


function hexToHsl(hex){
    var color = hexToRgb(hex);

    var r = color.r;
    var g = color.g;
    var b = color.b;

    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return   {
        h: h,
        s: s,
        l: l,
    } ;

}    

function rgbToHsv(color){
    var r = color.r;
    var g = color.g;
    var b = color.b;


    r = r/255, g = g/255, b = b/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if(max == min){
        h = 0; // achromatic
    }else{
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, v];
}


function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
} 


function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}



    function timeProgression() {
        
      // debugger;
        if (!$.isEmptyObject(startColor) && !$.isEmptyObject(endColor)) {

            
            var sec = parseInt($('.knob.second').val()) + ( parseInt($('.knob.minute').val() * 60 )) + ( parseInt($('.knob.hour').val() * 3600));
            

           // console.log(sec);


            var hPerS = Math.abs((endColor.h - startColor.h)) / sec;
            var sPerS = Math.abs((endColor.s - startColor.s)) / sec;
            var lPerS = Math.abs((endColor.l - startColor.l)) / sec;

            var hS = startColor.h;
            var sS = startColor.s;
            var lS = startColor.l;

            var hE = endColor.h;
            var sE = endColor.s;
            var lE = endColor.l;

            var socket = io.connect();

            var colors = [hS,sS,lS];

            counter=0;

            var pulse = sec / 60;
            var oldL = lS;

            var colorArray = [];

            while(counter < sec){
                    //normaler farbverlauf in positiver grad richtung
                    hS += hPerS;
                    sS += sPerS;
                    lS += lPerS;

                    colorArray[counter] = [hS,sS,lS];                    
                    counter++;      
            }
            
            for (var i = 0; i < colorArray.length; i++) {
                var colors = colorArray[i];
                var RGB = hslToRgb(colors[0],colors[1],colors[2]);
                var hex = rgbToHex(RGB[0],RGB[1],RGB[2]);
                colorArray[i] = hex;
            }

            //blinking in the end
            for (var i = 0; i < 5; i++) {
                if(i%2 == 0)
                    colorArray.push('#000000');
                else
                    colorArray.push(colorArray[colorArray.length-2]);
            }

            colorArray.push('#000000');
          
            socket.emit("timer",colorArray);
    }
}



