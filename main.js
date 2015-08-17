;(function() {
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
	var canvas = document.getElementById('main-canvas'),
			ctx = canvas.getContext('2d'),
			
			canvasWidth = canvas.width,
			canvasHeight = canvas.height,
			
			animParams = {animIntervalId: 0},			
			start = document.getElementById('start'),
			again = document.getElementById('again'),			
			
			//	constant globals
			_GRAVITY = .52,
			_FR =	.0085;
			
	
	function Ball(x, y, r, vx, vy, color) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.dampFactorX = .71;
		this.dampFactorY = .71;
		this.color = color ? color : "black";
		
		this.draw = function() {			
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI, true);
			ctx.fillStyle = this.color;
			ctx.fill();
			ctx.closePath();
			
			// ctx.beginPath();
			// ctx.moveTo(this.x, this.y);
			// ctx.lineTo(this.x + this.r, this.y + this.r);
			// ctx.lineWidth = 2;
			// ctx.strokeStyle = '#fff';
			// ctx.stroke();	
			// ctx.closePath();
		};
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
	
	function add(v1, v2) {
		return {
			x: v1.x + v2.x,
			y: v1.y + v2.y			
		};
	}
	
	function subtract(v1, v2) {
		return {
			x: v1.x - v2.x,
			y: v1.y - v2.y			
		};
	}
	
	function vecMulFactor(v, factor) {
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
				minDistance *= minDistance;
			
			if (c <= minDistance) {
				var un = normalize({x: dx, y: dy}),
				ut = {x: -un.y, y: un.x},					
				v1n = dotProduct(un, v1),		
				v1t = dotProduct(ut, v1),
				v2n = dotProduct(un, v2),
				v2t = dotProduct(ut, v2),
				temp; 
				
				temp = v1n;	v1n = v2n; v2n = temp;
				
				v1n = vecMulFactor(un, v1n);
				v2n = vecMulFactor(un, v2n);
				v1t = vecMulFactor(ut, v1t);
				v2t = vecMulFactor(ut, v2t);
				
				v1 = add(v1n, v1t);
				v2 = add(v2n, v2t);
				
				balls[i].vx = v1.x;
				balls[j].vx = v2.x;				
				balls[i].vy = v1.y;
				balls[j].vy = v2.y;
				
				balls[i].x += v1.x*1.3;
				balls[j].x += v2.x*1.3;
				// balls[i].y += v1.y*1.5;
				// balls[j].y += v2.y*1.5;
			}
	}
	
	function bounces(balls, angles) {
		var ball;
		animParams.animIntervalId = setInterval(function() {
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);
			for (var i = 0; i < balls.length; i++) {
				ball = balls[i];
				for (var j = i+1; j < balls.length; j++) {
					handleCollision(balls, i, j);
				}
							
				ball.x += ball.vx;
				ball.y += ball.vy;				
				
				ball.vx -= ball.vx * _FR;													//	friction power on x-axis
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
			}
		}, 25);		
	}

	
	var numBalls = 7,
			balls = [], 
			RADIUS = 20;	
	
	for (var i = 0; i < numBalls; i++) {
		balls.push( new Ball(-RADIUS*2 + ((i+1)*canvasWidth/numBalls), canvasHeight-RADIUS, RADIUS, 0, 0, getRandomColor()) );		
		balls[i].draw();
	}
	
	function onStartClicked(e) {
		var speed			= parseInt(document.getElementById("speed_input").value),
				alpha_min = parseInt(document.getElementById("angle_input_min").value),
				alpha_max = parseInt(document.getElementById("angle_input_max").value);
				
		if (typeof speed === 'undefined' || typeof alpha_max === 'undefined' 
			|| typeof alpha_min === undefined 
			|| isNaN(speed) || isNaN(alpha_min)
			|| isNaN(alpha_max)) {
			alert("Please specify speed and angles ... ");
			return;		
		}
		
		var angles = [];
		for (var i = 0; i < balls.length; i++) {			
			angles.push( [randomArbitary(alpha_min, alpha_max), randomArbitary(alpha_min, alpha_max)] );
			balls[i].vx = Math.cos( angles[i][0]*Math.PI/180 )*speed;
			balls[i].vy = Math.sin( angles[i][1]*Math.PI/180 )*speed;					
			balls[i].draw();			
		}		
		
		bounces(balls, angles);
		
		this.onclick = null;
		again.onclick = function() {
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
					ball.dampFactorY = .71;
					ball.dampFactorX = .71;
					//ball.color = getRandomColor();
					balls[i].draw();	
				}
			}
			start.onclick = onStartClicked;
		};		
	};
	
	start.onclick = onStartClicked;	
}());
