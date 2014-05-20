function games(target) {
	target = target.substring(1);
	$('body').children('div').hide();

	var back = '<div class="btn btn-default btn-lg btn-block" id="back" data-rel="back">Back</div>';
	if(!$('#back').length){
		$('body').append(back);
	}else{
		$('#back').show();
	}

	$('#back').click(function(){
		$('body').children('div').hide();
		$('.container').show();
    });

	display(target);

	function display(target){
		var div = $('<div>').addClass(target);
		if(!$('.' + target).length){
			switch(target){
				case "pong": 
					div.append("<div class='btn btn-default btn-lg btn-block'>Start Pong</div>");
					break;
				case "car" : 
					div.append("<img src='../img/controller.jpg'/>");
					break;
				case "fish": break;
			}
			$('body').append(div);
		}else{
			$('.' + target).show();
		}
	}
}