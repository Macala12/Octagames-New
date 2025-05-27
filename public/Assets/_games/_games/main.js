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