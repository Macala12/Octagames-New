    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    const main = document.getElementById("main");
    const loaderMain = document.querySelector(".loader-main");
  
    const loadingBar = document.querySelector('.loading-bar');
    const loadingText = document.getElementById('loadingText');
  
    const texts = [
    "Loading game...",
    "Getting Current Score...",
    "Setting Players...",
    "Get ready!",
    "Go!"
    ]; 
  
    let progress = 0;
  
    document.addEventListener('DOMContentLoaded', async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/tournament_page?Id=${id}`)
        const result = await response.json();
  
        if (!response.ok) {
          console.log(result.message);
          window.location.href = "../../../../404.html";
        }
        else{
          setInterval(async() => {
            try {
              const response = await fetch(`${API_BASE_URL}/topScore?id=${id}`)
              const result = await response.json();

              if (!response.ok) {
                console.log(result.message);
              }

              console.log(result);
              const scoreToBeat = result[0].score;
              const topscorebox = document.getElementById("topScore");
              topscorebox.innerText = `${scoreToBeat}`;
            } catch (error) {
            }
          }, 5000);
          console.log("Has not ended");
          const startTime = result.tournamentStartTime;
          const endTime = result.tournamentEndTime;

          const interval = setInterval(() => {
            progress += 1;
            loadingBar.style.width = `${progress}%`;
            
            if (progress >= 0 && progress < 25) {
              loadingText.textContent = texts[0];
            } else if (progress >= 25 && progress < 50) {
              loadingText.textContent = texts[1];
            } else if (progress >= 50 && progress < 75) {
              loadingText.textContent = texts[2];
            } else if (progress >= 75 && progress <= 100) {
              loadingText.textContent = texts[3];
            }
            
            if (progress >= 100) {
              clearInterval(interval);
              setTimeout(() => {
                loadingText.textContent = "Done!";
                loaderMain.style.display = "none";
                main.innerHTML = `<iframe src="index.html?id=${id}"></iframe>`;
              }, 500);
            }
          }, 50);
           
          const timer = document.querySelector(".timer_inner");

          const timerElement = document.createElement("span");
          timerElement.id = `timer-${id}`;

          const statusElement = document.createElement("span");
          statusElement.id = `status-${id}`;

          timer.appendChild(statusElement);
          timer.appendChild(timerElement);

          setupTournamentTimer(id, startTime, endTime);
        }
      } 
      catch (error) { 
      }
    });

    function setupTournamentTimer(tournamentId, startTimeStr, endTimeStr) {
      const startTime = new Date(startTimeStr).getTime();
      const endTime = new Date(endTimeStr).getTime();
      const timerElement = document.getElementById(`timer-${tournamentId}`);
      const statusElement = document.getElementById(`status-${tournamentId}`);
  
      if (startTimeStr == null || startTimeStr == "null") {
          statusElement.innerText = "Waiting"; 
          timerElement.innerText = "";
      }else{

          if (!timerElement || !statusElement) return;

          const interval = setInterval(() => {
              const now = new Date().getTime();

              if (now < startTime) {
                  // Before tournament starts
                  const timeLeft = startTime - now;
                  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                  statusElement.innerText = "Starts in:";
                  timerElement.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
              } else if (now >= startTime && now < endTime) {
                  // Tournament is live
                  const timeLeft = endTime - now;
                  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                  statusElement.innerText = `Live - Ends in: `;
                  timerElement.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

                  if (timeLeft <= 10000) {
                        main.innerHTML = `
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
                              Redirecting in 10s...
                            </p>
                          </div>
                        `;
                        let countdown = 10;
                        const countdownElement = document.getElementById('countdown');

                        const interval = setInterval(() => {
                          countdown--;
                          countdownElement.innerText = `Redirecting in ${countdown}s...`;

                          if (countdown <= 0) {
                            clearInterval(interval);
                            window.location.href = "../../../home.html";
                          }
                        }, 1000);

                  }

              } else {
                  // Tournament has ended
                  statusElement.innerText = "Ended";
                  timerElement.innerText = "";
                  clearInterval(interval);
              }
          }, 1000); 
      }
    } 