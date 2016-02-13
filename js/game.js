$(function () {
    var start = false, startText = new createjs.Text("Click To Start", "40px Helvetica", "#eb2546"), endText = new createjs.Text("Ohh no! You died.", "40px Helvetica", "#eb2546"),stage, player, powerupSprite, powerupSingle, powerUpH = 49, powerUpW = 50, stageW = 900, stageH = 500, background, playerW = 100, playerH = 92;
    var upPressed, downPressed, vy = 5, tickCounter = 0;
    var obstacleTop = new createjs.Shape(), obstacleContainerTop = new createjs.Container(),
        obstacleW = 50, obstacleH = 50, obstacleLoop = 500, obstacleSpeed = 5,
        obstacleBottom = new createjs.Shape(), obstacleContainerBottom = new createjs.Container(), powerupContainer = new createjs.Container();
    var bgSpriteW = 1100;
    var bgSpriteH = 326;
    var finalScore = 0, scoreText = new createjs.Text("0", "40px Helvetica", "#eb2546");
    var pointSound, runOnce = true;

    // init bunch of sounds
    ion.sound({
        sounds: [
            {name: "point"},
        ],

        // main config
        path: "/roo/sound/",
        preload: true,
        multiplay: true,
        volume: 0.9
    });
    $(window).resize(function () {
        resize();
    });

    $(document).click(function(){
        upPressed = true;
        if(!start) {
            start = true;
        }
    });

    init();
    initSprites();

    function score() {
        finalScore++;
    }

    function init() {
        stage = new createjs.Stage("grid");
        //Resize canvas onload
        stage.canvas.width = stageW;
        stage.canvas.height = stageH;
        //Resize function to be called when window resized
        resize();
        //Init ticker
        createjs.Ticker.timingMode = createjs.Ticker.RAF;
        createjs.Ticker.addEventListener("tick", tick);
    }

    function tick(event) {
        var deltaS = event.delta / 100;

        if(runOnce) {
            var myscore = setInterval(score, 1000);
            var powerupGen = setInterval(genPowerup, 2000);
            var topObs = setInterval(genTopObstacles, 1000);
            var botObs = setInterval(genBottomObstacles, 1000);
            runOnce = false;
        }

        if(start) {
            if(startText) {
                stage.removeChild(startText);
            }

            background.x -= deltaS * 30;
            if (background.x <= -bgSpriteW) {
                background.x = stage.canvas.width;
            }

            if (upPressed) {
                var newy = player.y - 100;
                createjs.Tween.get(player).to({y: newy}, 500, createjs.Ease.linear);

                upPressed = false;
            }

            if (player.y < stage.canvas.height - playerH) {
                player.y += 2.5;
            }

            if (tickCounter >= 5) {

                collisionObs();
                tickCounter = 0;
            }

            moveObstacles();
            playerCollision();
            scoreText.text = parseFloat(finalScore);

            tickCounter++;
            stage.update();
        }
    }


    function resize() {
        stage.canvas.width = stageW;
        stage.canvas.height = stageH;
    }

    function initSprites() {
        var playerSprite = new createjs.SpriteSheet({
            framerate: 30,
            "images": ["img/player.png"],
            "frames": {width: playerW, height: playerH, count: 1, regX: 0, regY: 0, spacing: 0, margin: 0},
            "animations": {
                "move": [0]
            }
        });

        var bgSprite = new createjs.SpriteSheet({
            framerate: 30,
            "images": ["img/bg.png"],
            "frames": {width: bgSpriteW, height: bgSpriteH, count: 1, regX: 0, regY: -200, spacing: 0, margin: 0},
        });

        var powerupSpritesheet = new createjs.SpriteSheet({
            framerate: 30,
            "images": ["img/cone_o.png"],
            "frames": {width: powerUpW, height: powerUpH, count: 1, regX: 0, regY: 0, spacing: 0, margin: 0},
        });

        player = new createjs.Sprite(playerSprite, "move");
        player.x = 0;
        player.y = stage.canvas.height/2;

        background = new createjs.Sprite(bgSprite);
        scoreText.x = 20;
        scoreText.y = 10;

        //startText.x = stageW/2 - startText
        startText.textAlign = "center";
        startText.textBaseline = "middle";
        startText.x = stageW/2;
        startText.y = stageH/2;
        endText.x = stageW/2 - 170;
        endText.y = stageH/2;

        powerupSprite = new createjs.Sprite(powerupSpritesheet);

        stage.addChild(background, player, obstacleContainerTop, obstacleContainerBottom, powerupContainer, scoreText, startText);

    }

    function genTopObstacles() {
        var randX = stage.canvas.width;
        var randY = (Math.random() * stage.canvas.height / 2) + 0;
        obstacleTop = new createjs.Shape();
        obstacleTop.graphics.beginFill("#df9e39");
        obstacleTop.graphics.drawRoundRect(0, 0, obstacleW, randY, 5);
        obstacleTop._rectangle.height = randY;
        obstacleTop._rectangle.width = obstacleW;
        obstacleTop.x = randX;
        obstacleTop.y = 0;
        obstacleTop.name = "bullet";
        obstacleContainerTop.addChild(obstacleTop);
        stage.update();

    }

    function genBottomObstacles() {
        var randX = stage.canvas.width;
        var randY = (Math.random() * stage.canvas.height / 3) + 0;
        obstacleBottom = new createjs.Shape();
        obstacleBottom.graphics.beginFill("#df9e39");
        obstacleBottom.graphics.drawRoundRect(0, 0, obstacleW, randY, 5);
        obstacleBottom._rectangle.height = randY;
        obstacleBottom._rectangle.width = obstacleW;
        obstacleBottom.x = randX;
        obstacleBottom.y = stage.canvas.height - randY;
        obstacleBottom.name = "bullet";
        obstacleContainerBottom.addChild(obstacleBottom);
        stage.update();

    }

    function genPowerup() {
        var randX = stage.canvas.width;
        var randY = (Math.random() * stage.canvas.height) + 1;
        powerupSingle = powerupSprite.clone();

        powerupSingle.x = randX;
        powerupSingle.y = randY;
        powerupContainer.addChild(powerupSingle);
        stage.update();

    }

    function collisionObs() {
        for (var i = 0; i < obstacleContainerTop.children.length; i++) {
            for (var j = 0; j < obstacleContainerTop.children.length; j++) {
                if (i != j) {
                    if ((obstacleContainerTop.children[i].x < obstacleContainerTop.children[j].x + obstacleW * 2) && (obstacleContainerTop.children[i].x + obstacleW * 2 > obstacleContainerTop.children[j].x) && (obstacleContainerTop.children[i].y < obstacleContainerTop.children[j].y + obstacleH * 2) && (obstacleH * 2 + obstacleContainerTop.children[i].y > obstacleContainerTop.children[j].y)) {
                        //obstacleContainerTop.removeChildAt(i);
                        obstacleContainerTop.removeChildAt(j);
                    }
                }
            }

            for (var powerI = 0; powerI < powerupContainer.children.length; powerI++) {
                if ((obstacleContainerTop.children[i].x < powerupContainer.children[powerI].x + powerUpW * 2) && (obstacleContainerTop.children[i].x + obstacleW * 2 > powerupContainer.children[powerI].x) && (obstacleContainerTop.children[i].y < powerupContainer.children[powerI].y + powerUpH * 2) && (obstacleH * 2 + obstacleContainerTop.children[i].y > powerupContainer.children[powerI].y)) {
                    powerupContainer.removeChildAt(i);
                }
            }
        }

        for (var k = 0; k < obstacleContainerBottom.children.length; k++) {
            for (var l = 0; l < obstacleContainerBottom.children.length; l++) {
                if (k != l) {
                    if ((obstacleContainerBottom.children[k].x < obstacleContainerBottom.children[l].x + obstacleW * 2) && (obstacleContainerBottom.children[k].x + obstacleW * 2 > obstacleContainerBottom.children[l].x) && (obstacleContainerBottom.children[k].y < obstacleContainerBottom.children[l].y + obstacleH * 2) && (obstacleH * 2 + obstacleContainerBottom.children[k].y > obstacleContainerBottom.children[l].y)) {
                        //obstacleContainerBottom.removeChildAt(i);
                        obstacleContainerBottom.removeChildAt(l);
                    }
                }

                for (var powerI = 0; powerI < powerupContainer.children.length; powerI++) {
                    if ((obstacleContainerBottom.children[k].x < powerupContainer.children[powerI].x + powerUpW * 2) && (obstacleContainerBottom.children[k].x + obstacleW * 2 > powerupContainer.children[powerI].x) && (obstacleContainerBottom.children[k].y < powerupContainer.children[powerI].y + powerUpH * 2) && (obstacleH * 2 + obstacleContainerBottom.children[k].y > powerupContainer.children[powerI].y)) {
                        powerupContainer.removeChildAt(powerI);
                    }
                }
            }
        }


    }

    function moveObstacles() {
        for (var i = 0; i < obstacleContainerTop.children.length; i++) {
            obstacleContainerTop.children[i].x -= obstacleSpeed;

            if (obstacleContainerTop.children[i].x < -100) {
                obstacleContainerTop.removeChildAt(i);
            }
        }

        for (var j = 0; j < obstacleContainerBottom.children.length; j++) {
            obstacleContainerBottom.children[j].x -= obstacleSpeed;

            if (obstacleContainerBottom.children[j].x < -100) {
                obstacleContainerBottom.removeChildAt(j);
            }
        }

        for (var k = 0; k < powerupContainer.children.length; k++) {
            powerupContainer.children[k].x -= obstacleSpeed;

            if (powerupContainer.children[k].x < 0) {
                powerupContainer.removeChildAt(k);
            }
        }
    }

    function playerCollision() {
        for (var j = 0; j < obstacleContainerTop.children.length; j++) {
            if ((player.x < obstacleContainerTop.children[j].x + obstacleContainerTop.children[j]._rectangle.width) && (player.x + playerW > obstacleContainerTop.children[j].x) && (player.y < obstacleContainerTop.children[j].y + obstacleContainerTop.children[j]._rectangle.height) && (playerH + player.y > obstacleContainerTop.children[j].y)) {
                stage.addChild(endText);
                start = false;
            }
        }

        for (var i = 0; i < obstacleContainerBottom.children.length; i++) {
            if ((player.x < obstacleContainerBottom.children[i].x + obstacleContainerBottom.children[i]._rectangle.width) && (player.x + playerW > obstacleContainerBottom.children[i].x) && (player.y < obstacleContainerBottom.children[i].y + obstacleContainerBottom.children[i]._rectangle.height) && (playerH + player.y > obstacleContainerBottom.children[i].y)) {
                stage.addChild(endText);
                start = false;
            }
        }

        for (var i = 0; i < powerupContainer.children.length; i++) {
            if ((player.x < powerupContainer.children[i].x + powerUpW) && (player.x + playerW > powerupContainer.children[i].x) && (player.y < powerupContainer.children[i].y + powerUpH) && (playerH + player.y > powerupContainer.children[i].y)) {
                powerupContainer.removeChildAt(i);
                ion.sound.play("point");
                finalScore+=50;
            }
        }
    }
});
