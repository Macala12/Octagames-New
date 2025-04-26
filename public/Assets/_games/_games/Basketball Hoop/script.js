const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const userid = sessionStorage.getItem('userid');

// Sizes Best for Display
      // NOTE: Originally 640x1000. Other possible sizes: 512x800, 400x625
      var game = new Phaser.Game(window.innerWidth, 800, Phaser.CANVAS, "", {
        preload: preload,
        create: create,
        update: update,
      });

      function preload() {
        game.load.image("ball", "assets/images/ball.png");
        game.load.image("hoop", "assets/images/hoop.png");
        game.load.image("side rim", "assets/images/side_rim.png");
        game.load.image("front rim", "assets/images/front_rim.png");

        game.load.image("win0", "assets/images/win0.png");
        game.load.image("win1", "assets/images/win1.png");
        game.load.image("win2", "assets/images/win2.png");
        game.load.image("win3", "assets/images/win3.png");
        game.load.image("win4", "assets/images/win4.png");
        game.load.image("lose0", "assets/images/lose0.png");
        game.load.image("lose1", "assets/images/lose1.png");
        game.load.image("lose2", "assets/images/lose2.png");
        game.load.image("lose3", "assets/images/lose3.png");
        game.load.image("lose4", "assets/images/lose4.png");

        game.load.audio("score", "assets/audio/score.wav");
        game.load.audio("backboard", "assets/audio/backboard.wav");
        game.load.audio("whoosh", "assets/audio/whoosh.wav");
        game.load.audio("fail", "assets/audio/fail.wav");
        game.load.audio("spawn", "assets/audio/spawn.wav");
      }

    var hoop,
        left_rim,
        right_rim,
        ball,
        front_rim,
        scoreMain = 0,
        score_text,
        current_score = 0,
        current_score_text,
        high_score = 0,
        high_score_text,
        current_best_text,
        failCount = 10,
        failed_count


      var score_sound, backboard, whoosh, fail, spawn;

      var moveInTween,
        fadeInTween,
        moveOutTween,
        fadeOutTween,
        emoji,
        emojiName;

      var collisionGroup;

      function create() {
        game.physics.startSystem(Phaser.Physics.P2JS);

        game.physics.p2.setImpactEvents(true);

        game.physics.p2.restitution = 0.63;
        game.physics.p2.gravity.y = 0;

        collisionGroup = game.physics.p2.createCollisionGroup();

        score_sound = game.add.audio("score");
        backboard = game.add.audio("backboard");
        backboard.volume = 0.5;
        whoosh = game.add.audio("whoosh");
        fail = game.add.audio("fail");
        fail.volume = 0.1;
        spawn = game.add.audio("spawn");

        game.stage.backgroundColor = "#fff";

        // high_score_text = game.add.text(450, 25, 'High Score\n' + high_score, { font: 'Arial', fontSize: '32px', fill: '#000', align: 'center' });
        current_score_text = game.add.text(187, 300, "", {
          font: "bold 13px Montserrat, sans-serif",
          fontSize: "60px",
          fill: "#0171d5",
          align: "center",
        }); // 300, 500
        current_best_text = game.add.text(130, 281, "", {
          font: "bold 13px Montserrat, sans-serif",
          fontSize: "20px",
          fill: "#808080",
          align: "center",
        });
        failed_count = game.add.text(210, 20, "", {
          font: "bold 13px Montserrat, sans-serif",
          fill: "#dc3545", // text color
          align: "center"
        }); // 230, 450
        score_text = game.add.text(20, 20, "", {
          font: "bold 15px Montserrat, sans-serif",
          fill: "#0171d5", // text color
          align: "center"
        });        
        current_best_score_text = game.add.text(177, 322, "", {
          font: "bold Montserrat, sans-serif",
          fontSize: "40px",
          fill: "#0171d5",
          align: "center",
        }); // 300, 500

        hoop = game.add.sprite(80, 62, "hoop"); // 141, 100
        left_rim = game.add.sprite(140, 185, "side rim"); // 241, 296
        right_rim = game.add.sprite(244, 185, "side rim"); // 398, 296

        game.physics.p2.enable([left_rim, right_rim], false);

        left_rim.body.setCircle(2.5);
        left_rim.body.static = true;
        left_rim.body.setCollisionGroup(collisionGroup);
        left_rim.body.collides([collisionGroup]);

        right_rim.body.setCircle(2.5);
        right_rim.body.static = true;
        right_rim.body.setCollisionGroup(collisionGroup);
        right_rim.body.collides([collisionGroup]);

        createBall();

        cursors = game.input.keyboard.createCursorKeys();

        game.input.onDown.add(click, this);
        game.input.onUp.add(release, this);
      }

      function update() {
        if (ball && ball.body.velocity.y > 0) {
          front_rim = game.add.sprite(148, 182, "front rim");
          ball.body.collides([collisionGroup], hitRim, this);
        }

        if (
          ball &&
          ball.body.velocity.y > 0 &&
          ball.body.y > 188 &&
          !ball.isBelowHoop
        ) {
          ball.isBelowHoop = true;
          ball.body.collideWorldBounds = false;
          var rand = Math.floor(Math.random() * 5);
          if (ball.body.x > 151 && ball.body.x < 249) {
            emojiName = "win" + rand;
            current_score += 1;
            scoreMain += 1;
            score_text.text = 'Score: ' + scoreMain;
            current_score_text.text = current_score;
            score_sound.play();
          } else {
            failCount -= 1;
            failed_count.text = 'Throws Remaining: ' + failCount;
            console.log(failCount)
            if (failCount == 0) {
            //Send Score to Backend
            async function updateScore() {
              document.querySelector("canvas").style.display = "none";
              const gameOverBox = document.querySelector(".game-over-contanier");
              const soundOver = new Audio("../../../_sound/mixkit-player-losing-or-failing-2042.wav");
              try {
                gameOverBox.style.display = "flex";
                gameOverBox.innerHTML = `
                  <h6 style="color: #66FCF1; width: 100vw;">Loading...</h6>
                `;
                const response = await fetch(`${API_BASE_URL}/update_user_score?gameScore=${scoreMain}&userid=${userid}&leaderboardId=${id}`);
                const result = await response.json();

                if (!response.ok) {
                  console.log(result.message);
                }else{
                  gameOverBox.innerHTML = `
                      <div>
                        <box style="display: flex; justify-content: center;">
                          <img src="../../../_icons/game-over.png" width="100px" alt="">
                        </box>
                        <gameDetails style="display: flex; justify-content: space-evenly; color: #fff; padding: 15px;">
                          <gameDetailsBox>
                            <h6>Current Score</h6>
                            <p>${scoreMain}</p>
                          </gameDetailsBox>
                          <gameDetailsBox>
                            <h6>leaderboard position</h6>
                            <p>${result.position}</p>
                          </gameDetailsBox>
                          <gameDetailsBox>
                            <h6>Best Score</h6>
                            <p>${result.score}</p>
                          </gameDetailsBox>
                        </gameDetails>
                        <a href="/" style="display: block; text-align: center; color: #35c6bc; text-decoration: none; margin-top: 10px; font-size: 14px; font-weight: 600;">Play again</a>
                        <a href="../../../../index.html" style="margin-top: 20px; background-color: #66FCF1; width: 60%; font-size: 14px !important; color: #1a1a1a; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
                          Back to game page
                        </a>
                      </div>
                  `;
                  soundOver.play();
                }
              } catch (error) {
                console.error("Error Updating Score",error)
              }
            }
            updateScore();
            }
            emojiName = "lose" + rand;
            fail.play();
            if (current_score > high_score) {
              high_score = current_score;
              // 	high_score_text.text = 'High Score\n' + high_score;
            }
            current_score = 0;
            current_score_text.text = "";
            current_best_text.text = "In a row";
            current_best_score_text.text = high_score;
          }
          emoji = game.add.sprite(180, 100, emojiName);
          emoji.scale.setTo(0.25, 0.25);
          moveInTween = game.add
            .tween(emoji)
            .from({ y: 150 }, 500, Phaser.Easing.Elastic.Out, true);
          fadeInTween = game.add
            .tween(emoji)
            .from(
              { alpha: 0 },
              200,
              Phaser.Easing.Linear.None,
              true,
              0,
              0,
              false
            );
          moveInTween.onComplete.add(tweenOut, this);
        }

        if (ball && ball.body.y > 1200) {
          game.physics.p2.gravity.y = 0;
          ball.kill();
          createBall();
        }
      }

      function tweenOut() {
        moveOutTween = game.add
          .tween(emoji)
          .to({ y: 50 }, 600, Phaser.Easing.Elastic.In, true);
        moveOutTween.onComplete.add(function () {
          emoji.kill();
        }, this);
        setTimeout(function () {
          fadeOutTween = game.add
            .tween(emoji)
            .to(
              { alpha: 0 },
              300,
              Phaser.Easing.Linear.None,
              true,
              0,
              0,
              false
            );
        }, 450);
      }

      function hitRim() {
        backboard.play();
      }

      function createBall() {
        var xpos;
        if (current_score === 0) {
          xpos = 200;
        } else {
          xpos = 60 + Math.random() * 280;
        }
        spawn.play();
        ball = game.add.sprite(xpos, 700, "ball");
        game.add
          .tween(ball.scale)
          .from(
            { x: 0.7, y: 0.7 },
            100,
            Phaser.Easing.Linear.None,
            true,
            0,
            0,
            false
          );
        game.physics.p2.enable(ball, false);
        ball.body.setCircle(60); // NOTE: Goes from 60 to 36
        ball.launched = false;
        ball.isBelowHoop = false;
      }

      var location_interval;
      var isDown = false;
      var start_location;
      var end_location;

      function click(pointer) {
        var bodies = game.physics.p2.hitTest(pointer.position, [ball.body]);
        if (bodies.length) {
          start_location = [pointer.x, pointer.y];
          isDown = true;
          location_interval = setInterval(
            function () {
              start_location = [pointer.x, pointer.y];
            }.bind(this),
            200
          );
        }
      }

      function release(pointer) {
        if (isDown) {
          window.clearInterval(location_interval);
          isDown = false;
          end_location = [pointer.x, pointer.y];

          if (end_location[1] < start_location[1]) {
            var slope = [
              end_location[0] - start_location[0],
              end_location[1] - start_location[1],
            ];
            var x_traj = (-2300 * slope[0]) / slope[1];
            launch(x_traj);
          }
        }
      }

      function launch(x_traj) {
        if (ball.launched === false) {
          ball.body.setCircle(36);
          ball.body.setCollisionGroup(collisionGroup);
          current_best_text.text = "";
          current_best_score_text.text = "";
          ball.launched = true;
          game.physics.p2.gravity.y = 2500;
          game.add
            .tween(ball.scale)
            .to(
              { x: 0.6, y: 0.6 },
              500,
              Phaser.Easing.Linear.None,
              true,
              0,
              0,
              false
            );
          ball.body.velocity.x = x_traj;
          ball.body.velocity.y = -1750;
          ball.body.rotateRight(x_traj / 3);
          whoosh.play();
        }
      }