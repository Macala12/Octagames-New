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
            } else {
                // Tournament has ended
                statusElement.innerText = "Ended";
                timerElement.innerText = "";
                clearInterval(interval);
            }
        }, 1000); 
    }
}

if (document.querySelector(".second_navigation")) {
    const initialNavigation = document.querySelector(".initial_navigation");

    const topNavigation = document.querySelector(".second_navigation");
    topNavigation.style.display = "none";


    window.addEventListener('scroll', function () {
        // Get the number of pixels the page has been scrolled vertically
        const scrollPosition = window.scrollY;

        // Change 300 to whatever threshold you want
        if (scrollPosition > 50) {
            initialNavigation.style.display = 'none';
        // Perform your action here
        console.log('Scrolled past 300px!');
        // You can also call a custom function
        triggerAction();
        }else{
            initialNavigation.style.display = 'flex';
            topNavigation.style.display = "none";
        }
    });

    function triggerAction() {
        topNavigation.style.display = "flex";
        topNavigation.classList.add('scrollNavigation');
        topNavigation.innerHTML = `
        <div class="_us_profile d-inline-flex mr-5">
            <div class="_us_img" id="_us_img">
                ${userimg}
            </div>
        <div class="_us_name mt-1 ml-2">
            <h6><b>
            </b></h6>
        </div>
        </div>
        <div class="_us_credentials d-flex">
            <a href="./points.html" class="d-flex">
                <div class="top_coin_box">
                    <img src="./Assets/_icons/coin.png" alt="">
                </div>
                <h6>
                    ${octaCoin}.00
                </h6>
                <button class="btn">
                    <i class="fi fi-br-add"></i>
                </button>
            </a>

            <a href="./reward.html" class="d-flex ml-3">
                <div class="top_coin_box">
                    <img src="./Assets/_icons/money.png" alt="">
                </div>
                <h6>
                    N${rewardAmount}.00
                </h6>
            </a>
        </div>
    `;
    }
}