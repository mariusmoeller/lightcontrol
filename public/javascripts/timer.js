function timer() {
    if($('.ccounter').length == 0){
        var div = '<div class="ccounter">' 
        + '<input class="knob hour" data-readOnly="false" data-width="150" data-min="0" data-max="24" data-displayPrevious=true data-fgColor="#66EE66" data-skin="tron" data-thickness=".2" value="75">' 
        + '<input class="knob minute" data-readOnly="false" data-width="150" data-min="0" data-max="60" data-displayPrevious=true data-fgColor="#ffec03" data-skin="tron" data-thickness=".2" value="75">' 
        + '<input class="knob second" data-readOnly="false" data-width="150" data-min="0" data-max="60" data-displayPrevious=true data-fgColor="#00CED1" data-skin="tron" data-thickness=".2" value="75">' 
        + '</div>';

        var button = '<div class="countdownControl btn btn-default btn-lg btn-block">Start</div>';
        $('body').append(div);
        $('.ccounter').append(button);

        $('.countdownControl').click(function (event) {
            var text = $(".countdownControl").text();
            if (text === "Start") {
                var hours = $('.knob.hour').val();
                var minutes = $('.knob.minute').val();
                var seconds = $('.knob.second').val();

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
                
                $(".countdownControl").text("Hide");
            } else if (text === "Hide") {
                $(".ccounter").remove();
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
}