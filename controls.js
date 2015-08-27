function createControls() {
	//	angles
	$(function() {
		$( "#angles_slider" ).slider({
			range: true,
			min: 0,
			max: 180,
			values: [ 0, 180 ],
			slide: function( event, ui ) {
				$( "#angles_amount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
			}
		});
		
		$( "#angles_amount" ).val( $( "#angles_slider" ).slider( "values", 0 ) +
			" - " + $( "#angles_slider" ).slider( "values", 1 ) );
	});
	
	//	speed
	$( "#speed_slider" ).slider({
		range: "max",
		min: 0,
		max: 100,
		step: 0.5,
		value: 20,
		slide: function( event, ui ) {
			$( "#speed_amount" ).val( ui.value  );
		}
	});
	$( "#speed_amount" ).val( $( "#speed_slider" ).slider( "value" ) );	
	
	//	gravity
	$( "#gravity_slider" ).slider({
		range: "max",
		min: 0,
		max: 1,
		step: 0.01,
		value: 0.52,
		slide: function( event, ui ) {
			$( "#gravity_amount" ).val( ui.value  );
		}
	});
	$( "#gravity_amount" ).val( $( "#gravity_slider" ).slider( "value" ) );	
	
	//	fforce
	$( "#ff_slider" ).slider({
		range: "max",
		min: 0,
		max: 1,
		step: 0.0001,
		value: 0.0085,
		slide: function( event, ui ) {
			$( "#ff_amount" ).val( ui.value  );
		}
	});
	$( "#ff_amount" ).val( $( "#ff_slider" ).slider( "value" ) );	
	
	//	dampening
	$( "#dampening_slider" ).slider({
		range: "max",
		min: 0,
		max: 1.0,
		step: 0.01,
		value: 0.71,
		slide: function( event, ui ) {
			$( "#dampening_amount" ).val( ui.value  );
		}
	});
	$( "#dampening_amount" ).val( $( "#dampening_slider" ).slider( "value" ) );		
	
	//	numballs
	$( "#numballs_slider" ).slider({
		range: "max",
		min: 1,
		max: 100,
		step: 1,
		value: 7,
		slide: function( event, ui ) {
			$( "#numballs_amount" ).val( ui.value  );
		}
	});
	$( "#numballs_amount" ).val( $( "#numballs_slider" ).slider( "value" ) );	
}

function controlsSliding() {
	var paramms = $("#params");		
	var val = -paramms.height() + $(".toggle").height();
	$(paramms).css({"top": val});
	var toggled = false;
	
	$("#toggle-button").click(function() {
		if (!toggled) {
			$(this).html("hide")
		}	else {
			$(this).html("Show parameters")
		}
		$(paramms).animate({
			top: toggled ? val : -val/6
		});
		toggled = !toggled;
	});
}	