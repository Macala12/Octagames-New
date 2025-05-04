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

var fullName ;
var email ;
var accountVerified;
var octaCoin;
var winStreak;
var winRate;
var percentCalculator;

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
                if (winRateHome == NaN) {
                    winRateHome = 0;
                    document.getElementById("winRate").innerHTML = winRateHome;
                }else{
                    document.getElementById("winRate").innerHTML = winRateHome;
                }
            }
            if (document.getElementById("level")) {
                document.getElementById("level").innerHTML = "Lv " + data.userLevel;
            }
            if (document.getElementById("xp")) {
                document.getElementById("xp").innerHTML = data.userXP + "/300XP";
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
            }
            if (document.getElementById("joined_date")) {
                const isoDate = data.createdAt;
                const date = new Date(isoDate);
                const readableDate = date.toLocaleString();
                document.getElementById("joined_date").innerHTML = readableDate;
            }
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

fetchUserGameInfo();
fetchUserInfo();