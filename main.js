(function() {	
	//	globals
	var canvas = $('#main-canvas'),
			ctx = canvas[0].getContext('2d'),
			
			canvasWidth = $(canvas).attr("width"),
			canvasHeight = $(canvas).attr("height"),
			
			animParams = {animIntervalId: 0},			
			run = $("#run"),			
			
			particles = [], 			
			params = {
				radius:				16,
				angles: 			[],
				init: 				function() {
												for (var i = 0; i < this.numParticles; i++) {
													this.angles.push( [randomArbitary(0, 180), randomArbitary(0, 180)] );
												}
											}
			},
			
			degToRad = Math.PI/180,
			radToDeg = 180/Math.PI;
	
	function init() {
		canvasWidth = canvas[0].parentNode.clientWidth;
		canvasHeight = canvas[0].parentNode.clientHeight;		
		canvas[0].width = canvasWidth;
		canvas[0].height = canvasHeight;
		params.init();
	}
	
	function randomArbitary(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	function getRandomColor() {
		var letters = '0123456789ABCDEF'.split('');
		var color = '#';
		for (var i = 0; i < 6; i++ ) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}	
	
	function Particle(x, y, r, vx, vy, dmpX, dmpY, color) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.vx = vx;
		this.vy = vy;
		this.dampFactorX = dmpX ? dmpX : 1;
		this.dampFactorY = dmpY ? dmpY : 1;
		this.color = color ? color : "blue";		
		this.draw = function() {			
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI, true);
			ctx.fillStyle = this.color;
			ctx.fill();
			ctx.fillStyle = "#000";
			ctx.stroke();
			ctx.closePath();
		};
	}	
	
	//	some math functions
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
	
	function handleBallsCollision(i, j) {
		var dx = particles[i].x - particles[j].x,
				dy = particles[i].y - particles[j].y,
				c = dx*dx + dy*dy,
				minDistance = particles[i].r + particles[j].r,				
				v1 = {x: particles[i].vx, y: particles[i].vy},
				v2 = {x: particles[j].vx, y: particles[j].vy};			
			
			//	need another algorithm to resolve colision
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
				
				particles[i].vx = v1.x;
				particles[j].vx = v2.x;				
				particles[i].vy = v1.y;
				particles[j].vy = v2.y;	 	
				
				var overlap = minDistance - Math.abs(Math.sqrt(c)),
				vxa = Math.abs(v1.x) + Math.abs(v2.x),
				vya = Math.abs(v1.y) + Math.abs(v2.y);
				
				particles[i].x += particles[i].vx / vxa * overlap; 
				particles[j].x += particles[j].vx / vxa * overlap; 
				particles[i].y += particles[i].vy / vya * overlap; 
				particles[j].y += particles[j].vy / vya * overlap;	
			}
	}

	function balls() {
		var ball;
		function render() {
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);			
			for (var i = 0; i < particles.length; i++) {
				ball = particles[i];							
				ball.x += ball.vx;
				ball.y += ball.vy;
				
				//console.log(ball.x)	
				ball.vx -= ball.vx * params.ff;		//	friction with the ground
				ball.vy += params.gravity;															
				
				if (ball.y + ball.r > canvasHeight || ball.y - ball.r < 0) {
					if (ball.y + ball.r > canvasHeight) {
						ball.y -= ball.y + ball.r - canvasHeight;	
					}	else {
						ball.y += ball.r - ball.y;
					}
					ball.vy = -ball.vy * ball.dampFactorY;					
					if (params.gravity > 1)
						params.gravity -= 0.5;						
				}
				
				if (ball.x + ball.r > canvasWidth || ball.x - ball.r < 0) {
					if (ball.x + ball.r > canvasWidth) {
						ball.x -= ball.x + ball.r - canvasWidth;	
					} else {
						ball.x += ball.r - ball.x;
					}
					ball.vx = -ball.vx*ball.dampFactorX;				
					if (params.ff > 0) {
						params.ff -= 0.001;
					} else {
						params.ff = 0;					
					}
				}
				
				for (var j = i+1; j < particles.length; j++) {
					handleBallsCollision(i, j);
				}
				ball.draw();
			}
			animParams.animIntervalId = requestAnimationFrame(render);
		}
		animParams.animIntervalId = requestAnimationFrame(render);		
	}	
	
	function createParticles(callback) {
		particles = [];
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		for (var i = 0; i < params.numParticles; i++) {
			particles.push(
				new Particle(
				-params.radius*2 + ((i+1)*canvasWidth/params.numParticles), 
				canvasHeight-params.radius,
				params.radius, 
				Math.cos( params.angles[i][0]*degToRad )*params.speed, 
				Math.sin( params.angles[i][1]*degToRad )*params.speed,
				params.dampFactorX,
				params.dampFactorY,
				getRandomColor()) //	"#0FABC1"
			);
			
			callback(particles[i]);
		}
	}
	
	var clicked = false;
	function onRunClicked(e) {		
		if (!clicked) {
			$(this).html("Pause");
			balls();				
		} else {
			$(this).html("Continue");
			if (animParams.animIntervalId) {
				cancelAnimationFrame(animParams.animIntervalId);				
			}
		}	
		clicked = !clicked;			
	};
	
	function setHandlers() {		
		$(run).click(onRunClicked);	
		$(window).resize(function() {			
			init();	
			createParticles(function(a) {				
				a.draw();
			});			
		});
		controlsSliding();
	}
	
	//	separate each parameter updating from others
	controls(params, function(param) {
		switch(param) {
			case "numBalls":
				if (params.numParticles > particles.length) {
					var i = particles.length;
					while (particles.length < params.numParticles) {
						params.angles.push( [randomArbitary(0, 180), randomArbitary(0, 180)] );
						particles.push(
							new Particle(
							randomArbitary(2*params.radius, canvasWidth), 
							randomArbitary(2*params.radius, canvasHeight),
							params.radius, 
							Math.cos( params.angles[i][0]*degToRad ) * params.speed, 
							Math.sin( params.angles[i++][1]*degToRad ) * params.speed,
							params.dampFactorX,
							params.dampFactorY,
							getRandomColor()) //	"#0FABC1"
						)
					} 
				} else if (params.numParticles < particles.length) {
					while (particles.length > params.numParticles) {
						particles.pop();
						params.angles.pop();
					}
				}				
			break;
			case "speed":
				for (var i = 0; i < particles.length; i++) {
					particles[i].vx = (particles[i].vx/Math.abs(particles[i].vx))*params.speed;
					particles[i].vy = (particles[i].vy/Math.abs(particles[i].vy))*params.speed;
				}		
			break;
			case "dampening":
				for (var i = 0; i < particles.length; i++) {
					particles[i].dampFactorX = params.dampFactorX == 0 ? 0.001 : params.dampFactorX;
					particles[i].dampFactorY = params.dampFactorY == 0 ? 0.001 : params.dampFactorY;
				}
			break;
			case "undefined":
				return;
		}	
	});	
	
	init();
	
	createParticles(function(a) {
		a.draw();
	});	
	
	setHandlers();	
	controlsSliding();
}());
