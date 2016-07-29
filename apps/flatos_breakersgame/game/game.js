(function(FlatOS, F, $) {

    var _w = new FlatOS.Window("flatos_breakersgame"),
        _a = new FlatOS.Application("flatos_breakersgame");

    // number of thumbnail rows
    var thumbRows = 2;
    // number of thumbnail cololumns
    var thumbCols = 8;
    // width of a thumbnail, in pixels
    var thumbWidth = 64;
    // height of a thumbnail, in pixels
    var thumbHeight = 64;
    // space among thumbnails, in pixels
    var thumbSpacing = 8;
    // array with finished levels and stars collected.
    // 0 = playable yet unfinished level
    // 1, 2, 3 = level finished with 1, 2, 3 stars
    // 4 = locked
    var gameConfig = _a.getUserConfig();
    // how many pages are needed to show all levels?
    // CAUTION!! EACH PAGE SHOULD HAVE THE SAME AMOUNT OF LEVELS, THAT IS
    // THE NUMBER OF LEVELS *MUST* BE DIVISIBLE BY THUMBCOLS*THUMBROWS
    var pages = gameConfig.levels.length / (thumbRows * thumbCols);
    // group where to place all level thumbnails
    var levelThumbsGroup;

    var levelSelectState = {
        // preloading graphic assets
        preload: function () {
            game.load.spritesheet("levels", "assets/misc/levels.png", 64, 64);
        },

        create: function () {
            game.stage.alpha = 0.75;
            game.stage.backgroundColor = "#333333";

            // the state title
            var title = game.add.text(32, 48, 'Level Select', {
                font: "32px Arial",
                fill: "#ffffff"
            });

            // creation of the thumbails group
            levelThumbsGroup = game.add.group();
            // determining level thumbnails width and height for each page
            var levelLength = thumbWidth * thumbCols + thumbSpacing * (thumbCols - 1);
            var levelHeight = thumbWidth * thumbRows + thumbSpacing * (thumbRows - 1);
            // looping through each page
            for (var l = 0; l < pages; l++) {
                // horizontal offset to have level thumbnails horizontally centered in the page
                var offsetX = (game.width - levelLength) / 2 + game.width * l;
                // I am not interested in having level thumbnails vertically centered in the page, but
                // if you are, simple replace my "20" with
                // (game.height-levelHeight)/2
                var offsetY = 128;
                // looping through each level thumbnails
                for (var i = 0; i < thumbRows; i++) {
                    for (var j = 0; j < thumbCols; j++) {
                        // which level does the thumbnail refer?
                        var levelNumber = i * thumbCols + j + l * (thumbRows * thumbCols);
                        // adding the thumbnail, as a button which will call thumbClicked function if clicked
                        var levelThumb = game.add.button(offsetX + j * (thumbWidth + thumbSpacing), offsetY + i * (thumbHeight + thumbSpacing), "levels", this.thumbClicked, this);
                        // shwoing proper frame
                        levelThumb.frame = gameConfig.levels[levelNumber];
                        // custom attribute
                        levelThumb.levelNumber = levelNumber + 1;
                        // adding the level thumb to the group
                        levelThumbsGroup.add(levelThumb);
                        // if the level is playable, also write level number
                        if (gameConfig.levels[levelNumber] < 4) {
                            var style = {
                                font: "18px Arial",
                                fill: "#333333"
                            };
                            var levelText = game.add.text(levelThumb.x + 5, levelThumb.y + 5, levelNumber + 1, style);
                            levelText.setShadow(2, 2, 'rgba(0,0,0,0.25)', 1);
                            levelThumbsGroup.add(levelText);
                        }
                    }
                }
            }
        },

        thumbClicked: function (button) {
            // the level is playable, then play the level!!
            if (button.frame < 4) {
                game.state.start('main', true, true, button.levelNumber);
            }
            // else, let's shake the locked levels
            else {
                var buttonTween = game.add.tween(button)
                buttonTween.to({
                    x: button.x + thumbWidth / 15
                }, 20, Phaser.Easing.Cubic.None);
                buttonTween.to({
                    x: button.x - thumbWidth / 15
                }, 20, Phaser.Easing.Cubic.None);
                buttonTween.to({
                    x: button.x + thumbWidth / 15
                }, 20, Phaser.Easing.Cubic.None);
                buttonTween.to({
                    x: button.x - thumbWidth / 15
                }, 20, Phaser.Easing.Cubic.None);
                buttonTween.to({
                    x: button.x
                }, 20, Phaser.Easing.Cubic.None);
                buttonTween.start();
            }
        }
    };

    // Create the main menu state
    var mainMenu = {
        preload: function () {

        },

        create: function () {

        },

        update: function () {

        }
    };

    // Create the state that will contain the whole game
    var mainState = {
        init: function (level) {
            this.level = (level || this.level) || 1;
            this.brickNB = 0;
        },

        preload: function () {
            game.load.image('paddle[0]', 'assets/paddle/big.png');
            game.load.image('paddle[1]', 'assets/paddle/medium.png');
            game.load.image('paddle[2]', 'assets/paddle/normal.png');
            game.load.image('brick[0]', 'assets/bricks/0.png');
            game.load.image('brick[1]', 'assets/bricks/1.png');
            game.load.image('brick[2]', 'assets/bricks/2.png');
            game.load.image('brick[3]', 'assets/bricks/3.png');
            game.load.image('bg[0]', 'assets/bg/alto.jpeg');
            game.load.image('bg[1]', 'assets/bg/adr.png');
            game.load.image('ball', 'assets/ball/ball.png');
        },

        create: function () {
            // Set the background color to blue
            game.stage.backgroundColor = '#3598db';

            // Add the background image
            var c = Math.round(Math.random() * 1);
            this.bgImage = game.add.tileSprite(0
                , game.height - game.cache.getImage('bg[' + c + ']').height
                , game.width
                , game.cache.getImage('bg[' + c + ']').height
                , 'bg[' + c + ']'
            );

            // Start the Arcade physics system (for movements and collisions)
            game.physics.startSystem(Phaser.Physics.ARCADE);

            // Add the physics engine to all the game objetcs
            game.world.enableBody = true;

            // Create the left/right arrow keys
            this.left = game.input.keyboard.addKey(Phaser.KeyCode.LEFT);
            this.right = game.input.keyboard.addKey(Phaser.KeyCode.RIGHT);

            // Pause the game
            this.esc = game.input.keyboard.addKey(Phaser.KeyCode.ESC);

            // Create a group that will contain all the bricks
            this.bricks = game.add.group();

            // Add 25 bricks to the group (5 columns and 5 lines)
            for (var i = 0; i < 8; i++) {
                for (var j = 0; j < 5; j++) {
                    var b = Math.round(Math.random() * 3);
                    // Create the brick at the correct position
                    var brick = game.add.sprite(32 + i * 72, 32 + j * 24, 'brick[' + b + ']');

                    // Make sure the brick won't move when the ball hits it
                    brick.body.immovable = true;

                    // Add the brick to the group
                    this.bricks.add(brick);
                    this.brickNB++;
                }
            }

            // Add the ball
            this.ball = game.add.sprite(320, 180, 'ball');

            // Make sure the ball will bounce when hitting something
            this.ball.body.bounce.setTo(1);
            this.ball.body.collideWorldBounds = true;

            // Give the ball some initial speed
            this.ball.body.velocity.x = 100;
            this.ball.body.velocity.y = 100;

            // Initial Paddle Speed
            this.paddleSpeed = 300;

            // Set a level
            switch (this.level) {
                case 1:
                    // Add the paddle at the bottom of the screen
                    this.paddle = game.add.sprite(320, 328, 'paddle[0]');
                break;

                case 2:
                    // Add the paddle at the bottom of the screen
                    this.paddle = game.add.sprite(320, 328, 'paddle[0]');
                    this.ball.body.velocity.x += 50;
                    this.ball.body.velocity.y += 50;
                break;

                case 3:
                    // Add the paddle at the bottom of the screen
                    this.paddle = game.add.sprite(320, 328, 'paddle[1]');
                break;

                case 4:
                    // Add the paddle at the bottom of the screen
                    this.paddle = game.add.sprite(320, 328, 'paddle[1]');
                    this.ball.body.velocity.x += 100;
                    this.ball.body.velocity.y += 100;
                break;

                case 5:
                    // Add the paddle at the bottom of the screen
                    this.paddle = game.add.sprite(320, 328, 'paddle[2]');
                break;

                default:
                    // Add the paddle at the bottom of the screen
                    this.paddle = game.add.sprite(320, 328, 'paddle[2]');
                    this.ball.body.velocity.x += 25 * (this.level - 4);
                    this.ball.body.velocity.y += 25 * (this.level - 4);
                    this.paddleSpeed += 25 * (this.level - 4);
                break;
            }

            // Make sure the paddle won't move when it hits the ball
            this.paddle.body.immovable = true;
            this.paddle.body.collideWorldBounds = true;
        },

        update: function () {
            // Move the paddle left/right when an arrow key is pressed
            if (this.left.isDown) {
                this.paddle.body.velocity.x = -this.paddleSpeed;
            } else if (this.right.isDown) {
                this.paddle.body.velocity.x = this.paddleSpeed;
            }
            // Stop the paddle when no key is pressed
            else {
                this.paddle.body.velocity.x = 0;
            }

            // Add collisions between the paddle and the ball
            game.physics.arcade.collide(this.paddle, this.ball);

            // Call the 'hit' function when the ball hits a brick
            game.physics.arcade.collide(this.ball, this.bricks, this.hit, null, this);

            // Restart the game if the ball is below the paddle
            // if (this.ball.y > this.paddle.y) {
            //     game.state.start('main', true, false, this.level);
            // }
        },

        // New function that removes a brick from the game
        hit: function (ball, brick) {
            brick.kill();
            this.brickNB--;

            if (this.brickNB <= 0) {
                game.state.start('finish', true, true, this.level);
            }
        }
    };

    // Create the gameover state
    var gameOverState = {
        preload: function () {

        },

        create: function () {
        },

        update: function () {

        }
    };

    // Create the finish level state
    var finishState = {
        init: function (level) {
            this.level = level || this.level;
        },

        preload: function () {
            game.load.image('next_level', 'assets/misc/next_level.png');
        },

        create: function () {
            game.stage.alpha = 0.75;
            game.stage.backgroundColor = "#333333";

            var title = game.add.text(32, 48, 'Level Finished !', {
                font: "32px Arial",
                fill: "#ffffff"
            });

            var nextBT  = game.add.button(48, 128, "next_level", this.nextLevel, this);
            var nextTXT = game.add.text(96, 136, 'Next level', {
                font: "16px Arial",
                fill: "#ffffff"
            });

            // Adding one star to this level
            if (gameConfig.levels[this.level-1] < 3) {
                gameConfig.levels[this.level-1]++;
            }

            // Activate the next level
            if (gameConfig.levels[this.level] == 4) {
                gameConfig.levels[this.level] = 0;
            }

            // Save current levels state
            _a.setUserConfig(gameConfig);
        },

        update: function () {
        },

        nextLevel: function () {
            // Start the level
            this.level++;
            game.state.start('main', true, true, this.level);
        }
    };

    // Initialize the game and start our state
    var game = new Phaser.Game(640, 360);

    game.state.add('menu', mainMenu);
    game.state.add('levelSelect', levelSelectState);
    game.state.add('main', mainState);
    game.state.add('gameOver', gameOverState);
    game.state.add('finish', finishState);

    game.state.start('levelSelect');

})(window.top.FlatOS, window.top.F, window.top.$);