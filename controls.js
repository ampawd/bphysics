function controls(params, updateParticles) {	
	var EPS = 0.01;
	//	speed
	$( "#speed_slider" ).slider({
		range: "max",
		min: 0.001,
		max: 30,
		step: 1,
		value: 25,
		slide: function( event, ui ) {
			params.speed = ui.value;			
			$( "#speed_amount" ).val( ui.value.toFixed(0) );			
			updateParticles("speed");
		}
	});
	$( "#speed_amount" ).val( $("#speed_slider").slider("option", "value") );
	params.speed = $("#speed_slider").slider("option", "value");
	
	//	gravity
	$( "#gravity_slider" ).slider({
		range: "max",
		min: 0,
		max: 1,
		step: 0.01,
		value: 0.52,
		slide: function( event, ui ) {
			$( "#gravity_amount" ).val( ui.value );			
			params.gravity = ui.value;
		}
	});
	$( "#gravity_amount" ).val( $("#gravity_slider").slider("option", "value") );
	params.gravity = $("#gravity_slider").slider("option", "value");
	
	//	fforce
	$( "#ff_slider" ).slider({
		range: "max",
		min: 0,
		max: 0.1,
		step: 0.0001,
		value: 0.0085,
		slide: function( event, ui ) {			
			$( "#ff_amount" ).val( ui.value );
			params.ff = ui.value;
		}
	});
	$( "#ff_amount" ).val( $("#ff_slider").slider("option", "value") );
	params.ff = $("#ff_slider").slider("option", "value");	
	
	//	dampening
	$( "#dampening_slider" ).slider({
		range: "max",
		min: 0,
		max: 1,
		step: 0.01,
		value: 0.51,
		slide: function( event, ui ) {
			var a = ui.value < 0.002 ? 1 : 
				(1.0 - ui.value).toFixed(4) < 0.019 ? 0 : (1.0 - ui.value).toFixed(4);
				//var b = ui.value < 0.002 ? 0 : ui.value;
			$( "#dampening_amount" ).val( a );
			params.dampFactorX = ui.value;
			params.dampFactorY = ui.value;
			updateParticles("dampening");
		}
	});
	$( "#dampening_amount" ).val( $("#dampening_slider").slider("option", "value") );
	params.dampFactorX = $("#dampening_slider").slider("option", "value");			
	params.dampFactorY = $("#dampening_slider").slider("option", "value");			
	
	//	numballs
	$( "#numparticles_slider" ).slider({
		range: "max",
		min: 1,
		max: 25,
		step: 1,
		value: 7,
		slide: function( event, ui ) {
			params.numParticles = ui.value;
			$( "#particles_amount" ).val( ui.value  );
			updateParticles("numBalls");
		}
	});
	$( "#particles_amount" ).val( $("#numparticles_slider").slider("option", "value") );
	params.numParticles = $("#numparticles_slider").slider("option", "value");	
}

function controlsSliding() {
	var params = $("#params");		
	var val = -params.height() + $(".toggle").height();
	$(params).css({"top": val});
	var toggled = false;
	
	$("#toggle-button").click(function() {
		if (!toggled) {
			$(this).html("hide")
		}	else {
			$(this).html("Show parameters")
		}
		$(params).animate({
			top: toggled ? val : -val/6
		});
		toggled = !toggled;
	});
}