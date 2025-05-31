const userid = sessionStorage.getItem("userid");
const loader = document.getElementById("loader");
const contentHolder = document.getElementById("mainContent");
const mainAlert = document.getElementById("mainAlert");

const activeNumber = sessionStorage.getItem("open_tournaments")
if (activeNumber) {
    document.querySelector(".active_count").innerHTML = activeNumber;
}else{
    document.querySelector(".active_count").style.background = "transparent";
}

var fullName;
var email;
var accountVerified;
var octaCoin;
var rewardAmount;
var userimg;
var winStreak;
var winRate;
var percentCalculator;
let tutorialVideo;

function fetchUserGameInfo() {
    if (userid) {
        fetch(`${API_BASE_URL}/fetch_game_info?userid=${userid}`)
        .then(response => {
            if (!response.ok) {
                const alert = document.createElement("div");
                alert.classList.add('alert');
                alert.classList.add('alertDanger');
                alert.classList.add('alert-dismissible');
                alert.classList.add('fade');
                alert.classList.add('show');

                alert.innerHTML = `
                   <i class="fi fi-rr-exclamation"></i> ${response.message}!
                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                `;

                mainAlert.appendChild(alert);
                throw new Error('User not found');
            }
            return response.json();
        })
        .then(data => {
            octaCoin = data.userOctacoin;
            winStreak = data.userStreak;
            winRate = Math.round(data.userTopWins / data.userGamesPlayed * 100);
            if (winRate == NaN) {
                winRate = 0;
            }
 
            console.log('User data:', data); 
            if (document.getElementById("octacoin")) {
                document.getElementById("octacoin").innerHTML = data.userOctacoin + ".00";
            }
            if (document.getElementById("streak")) {
                document.getElementById("streak").innerHTML = data.userStreak;
            }
            if (document.getElementById("topThree")) {
                document.getElementById("topThree").innerHTML = data.userTopWins;
            }
            if (document.getElementById("winRate")) {
                let winRateHome = Math.round(data.userTopWins / data.userGamesPlayed * 100) + "%";
                if (winRateHome === NaN || winRateHome === "NaN") {
                    winRateHome = 0;
                    document.getElementById("winRate").innerHTML = winRateHome;
                }else{
                    document.getElementById("winRate").innerHTML = winRateHome;
                }
            }
            if (document.getElementById("level")) {
                document.getElementById("level").innerHTML = "Lv " + data.userLevel;
            }
            if (document.querySelector(".stat_level")) {
                document.querySelector(".stat_level").innerHTML = `
                    <img src="./Assets/_icons/one.png" class="img-fluid" width="18px" alt="">
                    Level ${data.userLevel}
                `;
            }
            if (document.getElementById("xp")) {
                document.getElementById("xp").innerHTML = data.userXP + "/500XP";
            }
            if (document.getElementById("wins")) {
                document.getElementById("wins").innerHTML = data.userTopWins;
            }
            if (document.getElementById("loss")) {
                document.getElementById("loss").innerHTML = data.userGamesPlayed - data.userTopWins;
            }
            if (document.getElementById("played")) {
                document.getElementById("played").innerHTML = data.userGamesPlayed;
            }
            if (document.getElementById("_xp")) {
                document.getElementById("_xp").innerHTML = data.userXP;
            }

            if (data.userXP > 500) {
                updateLevel();
            }

            const progressBar1 = document.getElementById("progress-bar1");
            const progressBar2 = document.getElementById("progress-bar2");

            if (data.userLevel === 1) {
                if (progressBar1) {
                    percentCalculator = data.userXP * 100 / 500;
                    if (document.querySelector(".circular-progress")) {
                        document.querySelector(".circular-progress").style.background = `conic-gradient(#66FCF1 ${percentCalculator}%, #66fcf200 ${percentCalculator}% 100%)`;
                    }                
                    progressBar1.style.width = percentCalculator+"%";
                }
            }else{
                if (progressBar1 & progressBar2) {
                    document.getElementById("xp").innerHTML = data.userXP + "/1000XP";
                    percentCalculator = data.userXP * 100 / 1000;
                    progressBar1.style.width = "100%";
                    progressBar2.style.width = percentCalculator+"%"   
                }
                
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
    }else{
        window.location.href = "login.html";
    }
}

function fetchUserInfo() {
    if (userid) {
        fetch(`${API_BASE_URL}/fetch_info?userid=${userid}`)
        .then(response => {
            if (!response.ok) {
                const alert = document.createElement("div");
                alert.classList.add('alert');
                alert.classList.add('alertDanger');
                alert.classList.add('alert-dismissible');
                alert.classList.add('fade');
                alert.classList.add('show');

                alert.innerHTML = `
                   <i class="fi fi-rr-exclamation"></i> ${response.message}!
                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                `;

                mainAlert.appendChild(alert);
                throw new Error('User not found');
            }
            return response.json();
        })
        .then(data => {
            console.log('User data:', data); 
            fullName = data.firstName + " " + data.lastName;
            accountVerified = data.emailConfirmed
            email = data.email;
            if (document.querySelector(".circular-image")) {
                document.querySelector(".circular-image").style.background = `url('${data.userImg}')`;
            }
            if (document.getElementById("firstname")) {
                document.getElementById("firstname").innerHTML = data.firstName;
            }
            if (document.getElementById("lastname")) {
                document.getElementById("lastname").innerHTML = data.lastName;
            }
            if (document.querySelectorAll(".username")) {
                document.querySelectorAll(".username").forEach(username => {
                    username.innerHTML = data.username;
                });
            }
            if (document.getElementById("email")) {
                document.getElementById("email").innerHTML = data.email;
            }
            if (document.getElementById("phoneNumber")) {
                document.getElementById("phoneNumber").innerHTML = data.phoneNumber;
            }
            if (document.getElementById("_us_img")) {
                document.getElementById("_us_img").innerHTML = `<img src="${data.userImg}" alt="">`;
                userimg = `<img src="${data.userImg}" alt="">`;
            }
            if (document.getElementById("joined_date")) {
                const isoDate = data.createdAt;
                const date = new Date(isoDate);
                const readableDate = date.toLocaleString();
                document.getElementById("joined_date").innerHTML = readableDate;
            }

            if (data.completedTutorial === false || data.completedTutorial === "false") {
                if (data.showTutorial === true || data.showTutorial === "true") {
                    showTutorialModal();
                }else{
                    document.querySelector(".tutorial_container").style.display = "none";
                }
            }else{
                document.querySelector(".tutorial_container").style.display = "none"; 
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
    }else{
        window.location.href = "login.html";
    }
}

function fetchUserReward() {
    if (userid) {
        fetch(`${API_BASE_URL}/fetch_reward?userid=${userid}`)
        .then(response => {
            if (!response.ok) {
                const alert = document.createElement("div");
                alert.classList.add('alert');
                alert.classList.add('alertDanger');
                alert.classList.add('alert-dismissible');
                alert.classList.add('fade');
                alert.classList.add('show');

                alert.innerHTML = `
                   <i class="fi fi-rr-exclamation"></i> ${response.message}!
                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                `;

                mainAlert.appendChild(alert);
                throw new Error('User not found');
            }
            return response.json();
        })
        .then(data => {
            rewardAmount = data.rewardAmount;
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
    }else{
        window.location.href = "login.html";
    }
}

async function updateLevel() {
    try {
        const response = await fetch(`${API_BASE_URL}/update_level?userid=${userid}`);
        const result = await response.json();

        if (!response.ok) {
            const alert = document.createElement('div')
            alert.classList.add('mb-2');
            alert.innerHTML = `
                <div class="alert alertInfo alert-dismissible fade show">
                    <i class="fi fi-rr-gift mr-1"></i>You have active game(s) to play
                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                </div>
            `;

            alertBox.appendChild(alert);
        }else{
            console.log("success");
        }
    } catch (error) {
        
    }
}

function showTutorialModal() {
    if (document.querySelector(".tutorial_container")) {
        let tutorialContainer = document.querySelector(".tutorial_container");
        tutorialContainer.innerHTML = `
            <div class="tutorial_box">
                <img src="./Assets/_icons/logo.png" class="mb-3" width="50px" alt="">
                <h5>Welcome to Octagames</h5>
                    <p>
                        Here's a <b>short and fun</b> video tutorial to show you how to explore our platform and start making money while having a blast!
                        <br>
                        <span>
                            <b>Complete the video and get 100 free Octacoins to start playing and winning!</b>
                        </span>
                    </p>
                    <video class="tutorial_video mt-3 mb-3" src="./Assets/_videos/test_video.MP4" width="100%" height="200px" controls muted autoplay>
                        Your browser does not support the video tag.
                    </video>

                    <a href="" class="text-center">Click here to learn more about Octagames</a>
                    <span class="tutorial_btn_box">
                        <button class="btn w-100 disabled" id="tutorial_btn">Claim Free 100 Octacoin!</button>
                    </span>
                    <p class="text-center text-secondary mt-3" onclick="skipTutorial()">Skip tutorial and watch later</p>
            </div>
        `;
        tutorialContainer.style.display = "flex";
        tutorialVideo = document.querySelector(".tutorial_video");
        removeDisableBtn(tutorialVideo)
    }
}

function removeDisableBtn (tutorialVideo) {
    tutorialVideo.addEventListener("ended", async () => {
        const tutorialBtnBox = document.querySelector(".tutorial_btn_box");
        tutorialBtnBox.innerHTML = `
            <button class="btn w-100" id="tutorial_btn" onclick="claimTutorialCoin()">Claim Free 100 Octacoin!</button>
        `;
    });
}

async function claimTutorialCoin() {
    document.getElementById("tutorial_btn").innerHTML = ` 
        <span class="spinner-border spinner-border-sm"></span>
    `;
    try {
        const response = await fetch(`${API_BASE_URL}/claim_tutorial_reward?userid=${userid}`);
        const result = await response.json();

        if (!response.ok) {
            document.getElementById("tutorial_btn").innerHTML = ` 
               ${result.message}l
            `
        }else{
            console.log(result.message);
            const Octacoin = document.getElementById("octacoin").innerHTML;
            const sound = new Audio('./Assets/_sound/mixkit-game-level-completed-2059.wav');
            document.getElementById("octacoin").innerHTML = parseInt(Octacoin, 10) + 100;
            document.querySelector(".rewardHover .text-center").innerHTML = `
                <div class="icon_box">
                    <img src="./Assets/_icons/confetti-no-bg.png" alt="">
                </div>
                <h6 class="mt-5"><b>Congratulations!</b> Tutorial Completed 🥳</h6>
                <h5><img src="./Assets/_icons/coin.png" width="20px" class="" alt=""> +100</h5>

                <p style="font-size: 11px; font-weight: 600; text-align: center; color: #666666; margin-top: 10px; margin-bottom: 0px;">
                    Start <b>playing</b> and keeping <b>winning</b>
                </p>

                <button class="btn" onclick="closeHover()">Let's Go!</button>
                <p style="font-size: 11px; font-weight: 600; text-align: center; color: #666666; margin-top: 10px; margin-bottom: 10px;">
                    Made with ❤️ from octagames 
                </p>
            `;
            document.getElementById("rewardHover").style.display = "flex";
            sound.play();

            //Close the tutorial container and the notififcation container
            document.querySelector(".tutorial_container").style.display = "none";
            document.querySelector("._notification").style.display = "none";
        }
    } catch (error) {
        
    }

}

async function skipTutorial() {
    document.querySelector(".tutorial_container").style.display = "none";
    try {
        const response = await fetch(`${API_BASE_URL}/skip_tutorial?userid=${userid}`);
        const result = await response.json();

        if (!response.ok) {
            document.querySelector(".tutorial_container").style.display = "block";
        }else{
            console.log(result.message);
            const mainAlert = document.querySelector("._notification");
            const alert = document.createElement('div')
            alert.classList.add('mb-2');
            alert.innerHTML = `
                <div class="alert alertWarning fade show" onclick="showTutorialModal()">
                    &#x1F3A5 You haven't completed your tutorial video yet. <i class="fi fi-rr-angle-small-right float-right"></i>
                </div>
            `;
            mainAlert.appendChild(alert);
            document.querySelector(".tutorial_container").style.display = "none";
        }
    } catch (error) {
        
    }
}

fetchUserGameInfo();
fetchUserInfo();
fetchUserReward();
