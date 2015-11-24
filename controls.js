function controls(params, update) {
	//	angles
	// $(function() {
		// $( "#angles_slider" ).slider({
			// range: true,
			// min: 0,
			// max: 180,
			// values: [ 0, 180 ],
			// slide: function( event, ui ) {
				// $( "#angles_amount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
			// }
		// });
		
		// $( "#angles_amount" ).val( $( "#angles_slider" ).slider( "values", 0 ) +
			// " - " + $( "#angles_slider" ).slider( "values", 1 ) );
	// });
	
	var EPS = 0.01;
	//	speed
	$( "#speed_slider" ).slider({
		range: "max",
		min: 0.001,
		max: 30,
		step: 1,
		value: 15,
		slide: function( event, ui ) {
			params.speed = ui.value;			
			$( "#speed_amount" ).val( ui.value.toFixed(0) );			
			update();
		}
	});
	$( "#speed_amount" ).val( parseInt($( "#speed_slider" ).slider( "value" )) );	
	
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
			update();
		}
	});
	$( "#gravity_amount" ).val( $( "#gravity_slider" ).slider( "value" ) );	
	
	//	fforce
	$( "#ff_slider" ).slider({
		range: "max",
		min: 0.001,
		max: 0.1,
		step: 0.0001,
		value: 0.0085,
		slide: function( event, ui ) {			
			$( "#ff_amount" ).val( ui.value < 0.002 ? 0 : ui.value );
			params.ff = ui.value;
			update();
		}
	});
	$( "#ff_amount" ).val( $( "#ff_slider" ).slider( "value" ) );	
	
	//	dampening
	$( "#dampening_slider" ).slider({
		range: "max",
		min: 0.001,
		max: 1,
		step: 0.01,
		value: 0.71,
		slide: function( event, ui ) {
			var a = ui.value < 0.002 ? 1 : 
				(1.0 - ui.value).toFixed(4) < 0.019 ? 0 : (1.0 - ui.value).toFixed(4);
			//var	b = ui.value < 0.002 ? 0 : ui.value;
			$( "#dampening_amount" ).val( a );
			params.dampFactorX = ui.value;
			params.dampFactorY = ui.value;
			update();
		}
	});
	$( "#dampening_amount" ).val( $( "#dampening_slider" ).slider( "value" ) );		
	
	//	numballs
	$( "#numparticles_slider" ).slider({
		range: "max",
		min: 1,
		max: 15,
		step: 1,
		value: 7,
		slide: function( event, ui ) {
			params.numParticles = ui.value;
			$( "#particles_amount" ).val( ui.value  );
			update();
		}
	});
	$( "#particles_amount" ).val( $( "#numparticles_slider" ).slider( "value" ) );		
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
