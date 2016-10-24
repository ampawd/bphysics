;
(function() {
    //	globals
    var canvas = $('#main-canvas'),
        ctx = canvas[0].getContext('2d'),

        cnvW,
        cnvH,
        gridW,
        gridH,
        grid = [],
        particles = [],

        animParams = {
            animIntervalId: 0
        },
        run = $("#run"),

        params = {
            radius: 15,
            angles: [],
            init: function() {
                for (var i = 0; i < this.numParticles; i++) {
                    this.angles.push([randomArbitary(0, 180), randomArbitary(0, 180)]);
                }
            }
        },

        degToRad = Math.PI / 180,
        radToDeg = 180 / Math.PI;

    function init() {
        cnvW = canvas[0].parentNode.clientWidth;
        cnvH = canvas[0].parentNode.clientHeight;
        canvas[0].width = cnvW;
        canvas[0].height = cnvH;
        params.init();
        gridW = Math.ceil(cnvW / (params.radius * 2));
        gridH = Math.ceil(cnvH / (params.radius * 2));
    }

    function randomArbitary(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function Particle(x, y, r, vx, vy, dmpX, dmpY, color) {
        this.x = x;
        this.y = y;
        this.nx = x;
        this.ny = y;
        this.r = r;
        this.vx = vx;
        this.vy = vy;
        this.dampFactorX = dmpX ? dmpX : 1;
        this.dampFactorY = dmpY ? dmpY : 1;
        this.color = color ? color : "blue";
        this.draw = function() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, true);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.fillStyle = "#000";
            ctx.stroke();
            ctx.closePath();
        };
        this.limitSpeed = function() {
            if (Math.sqrt(this.vx * this.vx + this.vy * this.vy) >= 10) {
                this.vx = (this.vx / Math.abs(this.vx)) * 10;
                this.vy = (this.vy / Math.abs(this.vy)) * 10;
            }
        }
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
        return v1.x * v2.x + v1.y * v2.y;
    }

    function normalize(v) {
        var inv_l = 1.0 / Math.sqrt(v.x * v.x + v.y * v.y);
        return {
            x: v.x * inv_l,
            y: v.y * inv_l
        };
    }

    function collision(i, j) {
        var dx = particles[j].nx - particles[i].nx,
            dy = particles[j].ny - particles[i].ny,
            c = dx * dx + dy * dy,
            sqc = Math.sqrt(c),
            minDistance = particles[i].r + particles[j].r,
            v1 = {
                x: particles[i].vx,
                y: particles[i].vy
            },
            v2 = {
                x: particles[j].vx,
                y: particles[j].vy
            };

        if (c <= minDistance * minDistance) {
            var un = normalize({
                    x: dx,
                    y: dy
                }),
                ut = {
                    x: -un.y,
                    y: un.x
                },
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

            particles[i].nx = (particles[i].nx += particles[i].vx);
            particles[i].ny = (particles[i].ny += particles[i].vy);
            particles[j].ny = (particles[j].ny += particles[j].vx);
            particles[j].ny = (particles[j].ny += particles[j].vy);

            for (var k = 0; k < 2; k++) {
                var penetrationDepth = minDistance - sqc,
                    penetraionDirectionX = un.x,
                    penetraionDirectionY = un.y,
                    coeff = 0.5;
                particles[i].nx += -penetraionDirectionX * penetrationDepth * coeff;
                particles[i].ny += -penetraionDirectionY * penetrationDepth * coeff;
                particles[j].nx += penetraionDirectionX * penetrationDepth * coeff;
                particles[j].ny += penetraionDirectionY * penetrationDepth * coeff;
            }
        }
    }

    function updateParticles() {
        var ball;
        for (var i = 0; i <= gridW; i++) {
            grid[i] = [];
            for (var j = 0; j <= gridH; j++) {
                grid[i][j] = [];
            }
        }

        for (var i = 0; i < particles.length; i++) {
            ball = particles[i];
            ball.nx = (ball.x += ball.vx);
            ball.ny = (ball.y += ball.vy);
            ball.vx -= ball.vx * params.ff;
            //ball.vy += params.gravity; //	uncomment when gravity is enabled				

            var cellx = Math.floor(ball.x / (2 * ball.r));
            var celly = Math.floor(ball.y / (2 * ball.r));
            console.log(cellx, celly);
            //grid[cellx][celly].push(ball);
            //console.log(grid);
            //break;

            if (ball.ny + ball.r > cnvH || ball.ny - ball.r < 0) {
                if (ball.ny + ball.r > cnvH) {
                    ball.ny -= ball.ny + ball.r - cnvH;
                } else {
                    ball.ny += ball.r - ball.ny;
                }
                ball.vy = -ball.vy * ball.dampFactorY;
                //	uncomment when gravity is enabled
                //if (params.gravity > 1) {
                //	params.gravity -= 0.5;						
                //}
            }

            if (ball.nx + ball.r > cnvW || ball.nx - ball.r < 0) {
                if (ball.nx + ball.r > cnvW) {
                    ball.nx -= ball.nx + ball.r - cnvW;
                } else {
                    ball.nx += ball.r - ball.nx;
                }
                ball.vx = -ball.vx * ball.dampFactorX;
                if (params.ff > 0) {
                    params.ff -= 0.001;
                } else {
                    params.ff = 0;
                }
            }

            for (var j = i + 1; j < particles.length; j++) {
                collision(i, j);
            }

            ball.x = ball.nx;
            ball.y = ball.ny;
            ball.draw();
        }
    }

    function balls() {
        function drawScene() {
            ctx.clearRect(0, 0, cnvW, cnvH);
            updateParticles();
            animParams.animIntervalId = requestAnimationFrame(drawScene);
        }

        //	request animation
        animParams.animIntervalId = requestAnimationFrame(drawScene);
    }

    function createParticles(callback) {
        particles = [];
        ctx.clearRect(0, 0, cnvW, cnvH);
        for (var i = 0; i < params.numParticles; i++) {
            particles.push(
                new Particle(-params.radius * 2 + ((i + 1) * cnvW / params.numParticles),
                    cnvH - 5 * params.radius,
                    params.radius,
                    Math.cos(params.angles[i][0] * degToRad) * params.speed,
                    Math.sin(params.angles[i][1] * degToRad) * params.speed,
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

    controls(params, function(param) {
        switch (param) {
            case "numBalls":
                if (params.numParticles > particles.length) {
                    var i = particles.length;
                    while (particles.length < params.numParticles) {
                        params.angles.push([randomArbitary(0, 180), randomArbitary(0, 180)]);
                        particles.push(
                            new Particle(
                                randomArbitary(2 * params.radius, cnvW),
                                randomArbitary(2 * params.radius, cnvH),
                                params.radius,
                                Math.cos(params.angles[i][0] * degToRad) * params.speed,
                                Math.sin(params.angles[i++][1] * degToRad) * params.speed,
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
                    particles[i].vx = (particles[i].vx / Math.abs(particles[i].vx)) * params.speed;
                    particles[i].vy = (particles[i].vy / Math.abs(particles[i].vy)) * params.speed;
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


}());