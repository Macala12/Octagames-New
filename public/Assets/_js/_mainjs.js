document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch(`${API_BASE_URL}/reward_hover?userid=${userid}`);
    const result = await response.json();
    const sound = new Audio('./Assets/_sound/mixkit-game-level-completed-2059.wav');

    if (!response.ok) {
        console.log(result.message);
    }else{
        document.querySelector(".rewardHover .text-center").innerHTML = `
            <div class="icon_box">
                <img src="./Assets/_icons/confetti-no-bg.png" alt="">
            </div>
            <h6 class="mt-5"><b>Congratulations!,</b> you won 🥳</h6>
            <h5>+N${result.lastReward}</h5>
            <div class="d-flex justify-content-center mb-3">
                <span>
                    <img src="./Assets/_icons/fire.png" class="img-fluid" width="20px" alt="">
                    <box><b>${winStreak}</b> winning streak</box>
                </span>
            </div>
            <p style="font-size: 11px; font-weight: 600; text-align: center; color: #666666; margin-bottom: 0px;">
                <i class="fi fi-rr-info mr-1"></i>You have won <b>${winRate}% more</b> than other players today.
            </p>
            <p style="font-size: 11px; font-weight: 600; text-align: center; color: #666666; margin-top: 10px; margin-bottom: 0px;">
                Keep <b>playing</b> and keeping <b>winning</b>
            </p>
            <button class="btn" onclick="closeHover()">Got it!</button>
            <p style="font-size: 11px; font-weight: 600; text-align: center; color: #666666; margin-top: 10px; margin-bottom: 10px;">
                ⚡ Powered by Octagames
            </p>
        `;
        document.getElementById("rewardHover").style.display = "flex";
        sound.play();
    } 
});

async function closeHover() {
    const response = await fetch(`${API_BASE_URL}/reward_hover_close?userid=${userid}`);
    const result = await response.json();

    if (!response.ok) {
        console.log(result.message);
    }else{
        document.getElementById("rewardHover").style.display = "none";
    } 
}