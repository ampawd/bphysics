(function() {
	window.requestAnimFrame = (function(callback) {
		return window.requestAnimationFrame 
				|| window.webkitRequestAnimationFrame
				|| window.mozRequestAnimationFrame 
				|| window.oRequestAnimationFrame 
				|| window.msRequestAnimationFrame
				|| function(callback) {
							window.setTimeout(callback, 1000 / 60)
					 };
	})();
	
	//	globals
	var canvas = $('#main-canvas'),
			ctx = canvas[0].getContext('2d'),
			
			canvasWidth = $(canvas).attr("width"),
			canvasHeight = $(canvas).attr("height"),
			
			animParams = {animIntervalId: 0},			
			run = $("#run"),	
			
			//	default parameters
			_GRAVITY = .52,
			_FF =	0.0085,				//	fricion force
			
			//	dampening factors
			_DAMPFACTORX = .71,	
			_DAMPFACTORY = .71,
			
			balls = [], 
			numBalls = 7,
			RADIUS = 20;
			
			
	function Ball(x, y, r, vx, vy, color) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.dampFactorX = _DAMPFACTORX;
		this.dampFactorY = _DAMPFACTORY;
		this.color = color ? color : "blue";
		
		this.draw = function() {			
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI, true);
			ctx.fillStyle = this.color;
			ctx.fill();
			ctx.closePath();
		};
	}	
	
	function setBallNumber(ball, i) {
		ctx.font = RADIUS+"px arelia";
		ctx.fillStyle = '#fff';
		ctx.fillText(i+1, ball.x-5, ball.y+5);
	}
	
	function randomArbitary(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
	
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
				numBalls = ui.value;	
				$( "#numballs_amount" ).val( ui.value  );
			}
		});
		$( "#numballs_amount" ).val( $( "#numballs_slider" ).slider( "value" ) );	
	}
	
	function controlsTopPanel() {
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

	function getRandomColor() {
			var letters = '0123456789ABCDEF'.split('');
			var color = '#';
			for (var i = 0; i < 6; i++ ) {
				color += letters[Math.floor(Math.random() * 16)];
			}
			return color;
	}	
	
	function add(v1, v2) {
		return {
			x: v1.x + v2.x,
			y: v1.y + v2.y			
		};
	}
	
	function addScalar(v1, sum) {
		return {
			x: v1.x + sum,
			y: v1.y + sum
		};
	}
	
	function subtract(v1, v2) {
		return {
			x: v1.x - v2.x,
			y: v1.y - v2.y			
		};
	}
	
	function multScalar(v, factor) {
		return {
			x: v.x * factor,
			y: v.y * factor
		};		
	}
	
	function dotProduct(v1, v2) {
		return v1.x*v2.x + v1.y*v2.y;
	}
	
	function normalize(v) {
		var inv_l = 1.0/Math.sqrt(v.x*v.x + v.y*v.y);
		return {
				x: v.x*inv_l,
				y: v.y*inv_l
		};
	} 
	
	function handleCollision(balls, i, j) {
		var dx = balls[i].x - balls[j].x,
				dy = balls[i].y - balls[j].y,
				c = dx*dx + dy*dy,
				minDistance = balls[i].r + balls[j].r,				
				v1 = {x: balls[i].vx, y: balls[i].vy},
				v2 = {x: balls[j].vx, y: balls[j].vy};
			
			if (c <= minDistance*minDistance) {
				var un = normalize({x: dx, y: dy}),
				ut = {x: -un.y, y: un.x},					
				v1n = dotProduct(un, v1),		
				v1t = dotProduct(ut, v1),
				v2n = dotProduct(un, v2),
				v2t = dotProduct(ut, v2),
				temp;
				
				temp = v1n;
				v1n = v2n;
				v2n = temp;
				
				v1n = multScalar(un, v1n);
				v2n = multScalar(un, v2n);
				v1t = multScalar(ut, v1t);
				v2t = multScalar(ut, v2t);
				
				v1 = add(v1n, v1t);
				v2 = add(v2n, v2t);
				
				balls[i].vx = v1.x;
				balls[j].vx = v2.x;				
				balls[i].vy = v1.y;
				balls[j].vy = v2.y;
				
				var vxa = Math.abs(v1.x) + Math.abs(v2.x);
						
				var overlapx = minDistance - Math.abs(balls[i].x - balls[j].x);				
				balls[i].x += balls[i].vx / vxa * overlapx;
				balls[j].x += balls[j].vx / vxa * overlapx;
			}
	}
	
	function runPhysics(balls, angles) {
		var ball;
		animParams.animIntervalId = setInterval(function() {
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);
			
			balls.sort(function(a, b) {
				return a.x < b.x;
			})
			
			for (var i = 0; i < balls.length; i++) {
				ball = balls[i];
				for (var j = i+1; j < balls.length && balls[i].x + RADIUS > balls[j].x - RADIUS; j++) {
					handleCollision(balls, i, j);
				}
							
				ball.x += ball.vx;
				ball.y += ball.vy;				
				
				ball.vx -= ball.vx * _FF;													//	friction force on x-axis
				ball.vy += _GRAVITY;															//	acceleration given by gravity
				
				if (ball.y + ball.r > canvasHeight || ball.y - ball.r < 0) {
					if (ball.y + ball.r > canvasHeight) {
						ball.y -= ball.y + ball.r - canvasHeight;	
					}	else {
						ball.y += ball.r - ball.y;
					}
					ball.vy = -ball.vy * ball.dampFactorY;					//	dampening effect on y-axis	
					
					if (Math.abs(ball.vy) <= 3.0) {									//	realistic dampening
						ball.dampFactorY -= 0.05;					
					}	

					if (Math.abs(ball.vy) <= 0.3) {									//	avoid infinite bouncing
						ball.vy = 0.0;
						ball.dampFactorY = 0.0;
					}	
				}
				
				if (ball.x + ball.r > canvasWidth || ball.x - ball.r < 0) {
					if (ball.x + ball.r > canvasWidth) {
						ball.x -= ball.x + ball.r - canvasWidth;	
					} else {
						ball.x += ball.r - ball.x;
					}
					ball.vx = -ball.vx * ball.dampFactorX;
				}				
				
				ball.draw();
				setBallNumber(balls[i], i);	
			}
		}, 25);		
	}
	
	
	function initialDraw(balls, numBalls, RADIUS) {	
		balls.length = 0;
		for (var i = 0; i < numBalls; i++) {
			balls.push( new Ball(-RADIUS*2 + ((i+1)*canvasWidth/numBalls), 
									canvasHeight-RADIUS,
									RADIUS, 
									0, 
									0,
									"#0FABC1") );		//	"#0FABC1"
			balls[i].draw();
			setBallNumber(balls[i], i);
		}
	}
	
	var clicked = false;
	function onRunClicked(e) {		
		initialDraw(balls, numBalls, RADIUS);
		var speed			= parseInt($( "#speed_amount" ).val()),
				alpha_min = parseInt($( "#angles_slider" ).slider( "values", 0 )),
				alpha_max = parseInt($( "#angles_slider" ).slider( "values", 1 )),
				newGravity = parseFloat($( "#gravity_amount" ).val()),
				newFF = parseFloat($("#ff_amount").val()),
				newDAMPFACTOR = parseFloat($( "#dampening_amount" ).val());
				
				_GRAVITY = newGravity == _GRAVITY ? _GRAVITY : newGravity;	
				_FF = newFF == _FF ? _FF : newFF;	
				
				_DAMPFACTORX = newDAMPFACTOR;
				_DAMPFACTORY = newDAMPFACTOR;
		
		var angles = [];
		for (var i = 0; i < balls.length; i++) {			
			angles.push( [randomArbitary(alpha_min, alpha_max), randomArbitary(alpha_min, alpha_max)] );
			balls[i].vx = Math.cos( angles[i][0]*Math.PI/180 )*speed;
			balls[i].vy = Math.sin( angles[i][1]*Math.PI/180 )*speed;		
			balls[i].dampFactorX = _DAMPFACTORX;	
			balls[i].dampFactorY = _DAMPFACTORY;	
			balls[i].draw();			
		}		
		
		if (!clicked) {
			$(this).html("Stop");
			runPhysics(balls, angles);	
			
		} else {
			$(this).html("Run");
			if (animParams.animIntervalId) {
				ctx.clearRect(0, 0, canvasWidth, canvasHeight);
				clearInterval(animParams.animIntervalId);
				var ball;
				for (var i = 0; i < balls.length; i++) {
					ball = balls[i];
					ball.x = -RADIUS*2 + ((i+1)*canvasWidth/numBalls);
					ball.y = canvasHeight-ball.r;
					ball.vx = Math.cos(randomArbitary(alpha_min, alpha_max)*Math.PI/180)*speed;
					ball.vy = Math.sin(randomArbitary(alpha_min, alpha_max)*Math.PI/180)*speed;						
					ball.dampFactorX = _DAMPFACTORX;
					ball.dampFactorY = _DAMPFACTORY;
					balls[i].draw();
					setBallNumber(balls[i], i);
				}
			}
		}
		clicked = !clicked;			
	};
	
	function setHandlers( ) {		
		$(run).click(onRunClicked);	
	}	
	
	
	createControls();
	controlsTopPanel();
	setHandlers();
	initialDraw(balls, numBalls, RADIUS);
	
}());
