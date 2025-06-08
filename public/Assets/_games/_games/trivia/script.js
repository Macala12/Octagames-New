const userid = sessionStorage.getItem('userid');
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");


const categories = [
    { id: 1, name: "General Knowledge" },
    { id: 2, name: "History" },
    { id: 3, name: "Sports" },
    { id: 4, name: "Science" },
    { id: 5, name: "Mathematics" },
    { id: 6, name: "Reasoning" },
    { id: 7, name: "Music" },
    { id: 8, name: "Guess the Logo & Country" },
    { id: 9, name: "Guess the Logo & Country" },
  ];
  
  let dataset = {};  // Initialize an empty dataset
  
  let currentQuestion = 0;
  let score = 0;
  let currentTime = 10;
  const maxTime = 30;
  let timerInterval;
  let live = 5;

  const soundCorrect = new Audio("./img/mixkit-correct-answer-tone-2870.wav");
  const soundFailed = new Audio("./img/mixkit-wrong-long-buzzer-954.wav");
  const soundNewQuestion = new Audio("./img/mixkit-tile-game-reveal-960.wav");
  const soundTimer = new Audio("./img/mixkit-tick-tock-clock-timer-1045.wav");

  
  let currentTriviaQuestion = {}; // Store the current trivia question
  
  const questionElem = document.getElementById("question");
  const optionsElem = document.getElementById("options");
  const timerElem = document.getElementById("timer");
  const scoreElem = document.getElementById("score");
  const liveElem = document.getElementById("live_counter");
  
    // Display initial score
    scoreElem.innerHTML = `Score: ${score}`;

    //Display initial live
    liveElem.innerHTML = `${live}`
    
    // Update the timer display
    function updateTimerDisplay() {
      timerElem.textContent = `⏱ ${currentTime}s`;
    }
  
    // Start the timer
    function startTimer() {
      clearInterval(timerInterval);
      updateTimerDisplay();
      soundTimer.play();
      
      timerInterval = setInterval(() => {
        currentTime--;
        updateTimerDisplay();
        if (currentTime <= 0) {
          clearInterval(timerInterval);
          handleAnswer(null); // timeout
        }
      }, 1000);
    }
  
    // Load a random question
    function loadRandomQuestion() {
        // Get a random category
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        
        // Filter dataset for questions from the selected category
        const availableQuestions = dataset.filter(q => q.category === randomCategory.name);
        
        if (!availableQuestions || availableQuestions.length === 0) {
        console.warn("No questions found in category:", randomCategory.name);
        loadRandomQuestion(); // Retry with a different category
        return;
        }
    
        // Pick a random question from the filtered questions
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        currentTriviaQuestion = availableQuestions[randomIndex];
        
        // Update the question and options
        questionElem.textContent = currentTriviaQuestion.text;
        optionsElem.innerHTML = "";
    
        // Shuffle options
        const allOptions = [...currentTriviaQuestion.options];
        allOptions.sort(() => Math.random() - 0.5); // Shuffle
        
        allOptions.forEach(option => {
        const btn = document.createElement("button");
        btn.textContent = option;
        btn.className = "option-btn";
        btn.onclick = () => handleAnswer(option, btn);
        optionsElem.appendChild(btn);
        });
    
        startTimer();
    }
  
    // Disable all answer buttons
    function disableAllButtons() {
      const buttons = document.querySelectorAll(".option-btn");
      buttons.forEach(btn => btn.disabled = true);
    }
  
    // Handle answer selection
    function handleAnswer(selectedOption, selectedButton = null) {
        clearInterval(timerInterval);
        const correctAnswer = currentTriviaQuestion.correct;
        
        // Highlight correct and wrong answers
        const buttons = document.querySelectorAll(".option-btn");
        buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === correctAnswer) {
            btn.style.backgroundColor = "#00e676"; // green (correct answer)
            btn.style.color = "#000";
        } else if (btn === selectedButton && selectedOption !== correctAnswer) {
            btn.style.backgroundColor = "#dc3545"; // red (wrong answer)
        }
        });
    
        // Check if the answer is correct
        const isCorrect = selectedOption === correctAnswer;
    
        // Carry-over timer logic
        if (isCorrect) {
          soundTimer.pause();
          soundTimer.currentTime = 0;
          soundCorrect.play();
          const carryOver = currentTime;
          scoreElem.innerHTML = `Score: ${score += 10}`;  // Update score
          currentTime = Math.min(10 + carryOver, maxTime);  // Add carry-over time

        } else {
          soundTimer.pause();
          soundTimer.currentTime = 0;
          soundFailed.play();
          liveElem.innerHTML = `${--live}`
          if (live == 0) {
              //Send Score to Backend
              async function updateScore() {
                  document.getElementById("gameBox").style.display = "none";
                  document.querySelector("body").style.background = "url('./')";
                  const gameOverBox = document.querySelector(".game-over-contanier");
                  const soundOver = new Audio("../../../_sound/mixkit-player-losing-or-failing-2042.wav");
                  try {
                      gameOverBox.style.display = "flex";
                      gameOverBox.innerHTML = `
                      <h6 style="color: #66FCF1; width: 100vw;">Loading...</h6>
                      `;
                      const response = await fetch(`${API_BASE_URL}/update_user_score?gameScore=${score}&userid=${userid}&leaderboardId=${id}`);
                      const result = await response.json();

                      if (!response.ok) {
                      console.log(result.message);
                      window.parent.location.href = "../../../../home.html";
                  }else{
                      gameOverBox.innerHTML = `
                          <div>
                              <box style="display: flex; justify-content: center;">
                              <img src="../../../_icons/game-over.png" width="100px" alt="">
                              </box>
                              <gameDetails style="display: flex; justify-content: space-evenly; color: #fff; padding: 15px;">
                              <gameDetailsBox>
                                  <h6>Current Score</h6>
                                  <p>${score}</p>
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
                              <a id="playAgain">Play again</a>
                              <a id="backToGame" class="btn">
                              Back to game page
                              </a>
                          </div>
                      `;
                      soundOver.play();

                      const playagain = document.getElementById("playAgain");
                      const backtohome = document.getElementById("backToGame");
                      
                      playagain.addEventListener('click', async () => {
                      window.parent.location.reload();
                      });
                      backtohome.addEventListener('click', async () => {
                      // window.location.href = "../../../../home.html";
                          window.parent.history.back();
                      });
                      }
                  } catch (error) {
                      console.error("Error Updating Score",error)
                  }
              }
              if (sessionStorage.getItem("gameplayover")) {
                updateScore();
              }
          }
          currentTime = 10;  // Reset time if answer is incorrect
        }
    
        // Next question after a short delay
        setTimeout(() => {
          soundNewQuestion.play();
        loadRandomQuestion(); // Fetch new random question
        }, 1500);
    }
  
  
  // Fetch the JSON data
  fetch('./full_quiz_dataset.json') // Replace with the actual path to your JSON file
    .then(response => response.json())  // Parse the response as JSON
    .then(data => {
      dataset = data;  // Store the loaded data in the dataset variable
      console.log("Dataset loaded:", dataset);  // You can check the loaded data in the console
      loadRandomQuestion();  // Now you can load the first random question
    })
    .catch(error => console.error('Error loading the questions:', error));
  

    let countdown = 5;
    const gamePlayOverInterval = setInterval(() => {
    const gamePlayOver = sessionStorage.getItem("gameplayover");
    if (gamePlayOver) {
    document.getElementById("gameBox").remove()
    const gameplayoverbox = document.querySelector(".gamePlayOver");
    gameplayoverbox.innerHTML = `
      <div>
        <box style="display: flex; justify-content: center; margin-top: 300px; height: fit-content;">
          <img src="../../../_icons/game-over.png" width="100px" alt="">
        </box>
        <h4 style="
          color: #66fcf1;
          text-align: center;
        ">
        Gameplay is over
        </h4>
        <p style="
          text-align: center;
          color: #fff;
          font-weight: 600;
          font-size: 13px;
          " id="countdown">
          Finalizing in 5s...
        </p>
      </div>
    `;

    const countdownElement = document.getElementById('countdown');

    countdown--;
    countdownElement.innerText = `Finalizing in ${countdown}s...`;

    if (countdown <= 0) {
      clearInterval(gamePlayOverInterval);
      async function updateScore() {

        gameplayoverbox.remove();

        const gameDiv = document.getElementById("gameBox");
        gameDiv.style.display = "none";
        gameDiv.remove();

        
        const gameOverBox = document.querySelector(".game-over-contanier");
        const soundOver = new Audio("../../../_sound/mixkit-player-losing-or-failing-2042.wav");
        try {
          gameOverBox.style.display = "flex";
          gameOverBox.innerHTML = `
            <h6 style="color: #66FCF1; width: 100vw;">Loading...</h6>
          `;
          const response = await fetch(`${API_BASE_URL}/update_user_score?gameScore=${score}&userid=${userid}&leaderboardId=${id}`);
          const result = await response.json();

          if (!response.ok) {
            console.log(result.message);
            window.parent.location.href = "../../../../home.html";
          }else{
            gameOverBox.innerHTML = `
                <div>
                  <box style="display: flex; justify-content: center;">
                    <img src="../../../_icons/game-over.png" width="100px" alt="">
                  </box>
                  <gameDetails style="display: flex; justify-content: space-evenly; color: #fff; padding: 15px;">
                    <gameDetailsBox>
                      <h6>Current Score</h6>
                      <p>${gamePlayOverScore}</p>
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
                  <a id="backToGame" class="btn">
                  Back to game page
                  </a>
                </div>
            `;
            soundOver.play();
            
            const backtohome = document.getElementById("backToGame");
            
            backtohome.addEventListener('click', async () => {
              window.parent.history.back();
            });
          }
        } catch (error) {
          console.error("Error Updating Score",error)
        }
      }
      updateScore();
      sessionStorage.removeItem("gameplayover");
    }
    }else{
    console.log("Not yet gameplay");
    }
    }, 1000);