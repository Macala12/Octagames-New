document.querySelector("main").style.display = "none";
const userId = sessionStorage.getItem("userid");
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const tag = urlParams.get("tag");

var topOne;
var topTwo;
var topThreeUser;
var rank;
var tournamentStatus;
var entryAmount;
var playersNumber;
var _players_joinedinnerHTML = `
    <div class="_players_joined">
        <h5></h5>
        <div class="desc">
            <h6>Description</h6>
                <div class="mb-2 tags">
                    <span class="badge tagOne"></span>
                    <span class="badge tagTwo"></span>
                    <span class="badge tagThree"></span>
                </div>
            <p></p>
        </div>
        <div class="_players_joined_user_img" data-start-time="" data-end-time="">
            <i class="topThree" id="topthree">
            </i>
            <span class="_players_numbers" id="_players_numbers">
            </span>
            <span class="float-right mr-2" id="time">

            </span>
            <div class="exclusive_count">
            </div>
            <div class="reward mt-3">
                <div class="reward_box_">
                    <div class="d-flex justify-content-center mb-3">
                        <img src="./Assets/_icons/1st-prize.png" width="30px" alt="">
                    </div>
                    <h5 id="firstPrize"></h5>
                    <h6>1st Place Prize</h6>
                </div>
                <div class="reward_box_">
                    <div class="d-flex justify-content-center mb-3">
                        <img src="./Assets/_icons/2nd-place.png" width="30px" alt="">
                    </div>
                    <h5 id="secondPrize"></h5>
                    <h6>2nd Place Prize</h6>
                </div>
                <div class="reward_box_">
                    <div class="d-flex justify-content-center mb-3">
                        <img src="./Assets/_icons/3rd-place.png" width="30px" alt="">
                    </div>
                    <h5 id="thirdPrize"></h5>
                    <h6>3rd Place Prize</h6>
                </div>
            </div>
        </div>
    </div>
    <div class="d-flex justify-content-center mt-2" id="joinBtn">
    </div>
`;

let addUserRequest = false;

const tooltipTriggerEl = document.getElementById('myTooltip');
const tooltip = new bootstrap.Tooltip(tooltipTriggerEl);

// Show the tooltip programmatically
tooltip.show();

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById("_players_joined").innerHTML = _players_joinedinnerHTML;
});

async function refetching() {
    try {
        const response = await fetch(`${API_BASE_URL}/tournament_page?Id=${id}&tag=${tag}`);
        const result = await response.json();

        if (!response.ok) {
            console.log(result.message);

            try {
                const winnerRes = await fetch(`${API_BASE_URL}/tournament_winners?id=${id}`);
                const winnerResult = await winnerRes.json();

                if (!winnerRes.ok) {
                    showAlert(winnerResult.message);
                    window.location.href = "404.html";
                } else {
                    displayWinners(winnerResult.firstWinner, winnerResult.secondWinner, winnerResult.thirdWinner);
                }
            } catch (err) {
                console.log("Error fetching winners:", err);
            }

            return;
        }
        updateTournamentUI(result);
        checkIfUserIsJoined(result.status, result._id, result.entryAmount, result.tournamentPlayUrl);
    } catch (err) {
        console.log("Error fetching tournament:", err);
    }
}

async function getLeaderboard(id) {
    try {
        const refreshingStatus = document.getElementById("refreshingStatus");
        refreshingStatus.style.fontSize = '12px';
        refreshingStatus.style.fontWeight = '600px';
        refreshingStatus.innerHTML = 'Updating...';
        const response = await fetch(`${API_BASE_URL}/getLeaderboard?Id=${id}`);

        if (!response.ok) {
            const error = await response.json();
            return;
        }

        const players = await response.json();
        playersNumber = players.number;

        const leaderboardTable = document.querySelector("#leaderboardTable tbody");
        leaderboardTable.innerHTML = ""; 

        const leaderboard = players.leaderboard;

        if (leaderboard.length === 0) {
            leaderboardTable.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="_empty text-center py-2">
                            <h6>No player has <b>joined tournament</b> yet</h6>
                        </div>
                    </td>
                </tr>
            `;
            refreshingStatus.innerHTML = '';
            return;
        }

        leaderboard.forEach((player, index) => {
            const row = document.createElement("tr");
            row.id = `${player.userId}`;

            let statusIcon = player.status;
            if (player.userId == userId) {
                row.style.color = "#66FCF1";
                row.style.fontWeight = "600";

                rank = index + 1;
                console.log(rank);
                const prevRank = parseInt(sessionStorage.getItem(player.leaderboardId));

                if (!prevRank) {
                    sessionStorage.setItem(player.leaderboardId, rank);
                } else {
                    if (prevRank > rank) {
                        statusIcon = `<i class="fi fi-rr-caret-up text-success"></i>`;
                    } else if (prevRank === rank) {
                        statusIcon = `<i class="fi fi-rr-menu-dots"></i>`;
                    } else {
                        statusIcon = `<i class="fi fi-rr-caret-down text-danger"></i>`;
                    }
                    sessionStorage.setItem(player.leaderboardId, rank);
                }
            }

            row.innerHTML = `
                <td>${statusIcon}</td>
                <td>${index + 1}</td>
                <td class="d-flex align-items-center">
                    <img src="${player.userImg}" class="img-fluid mr-1" alt="user-pic" width="15px"> 
                    ${player.username}
                </td>
                <td>${player.played}</td>
                <td>${player.score}</td>
                <td></td>
            `;

            leaderboardTable.appendChild(row);
        });

        refreshingStatus.innerHTML = '';

        // Safely assign top 3 user images
        const topThree = leaderboard.slice(0, 3);
        topOne = topThree[0]?.userImg || "https://api.dicebear.com/9.x/big-smile/svg?seed=George&radius=50&backgroundType=gradientLinear&randomizeIds=true&skinColor=643d19,8c5a2b,a47539,c99c62&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf";
        topTwo = topThree[1]?.userImg || "https://api.dicebear.com/9.x/big-smile/svg?seed=Michael&radius=50&backgroundType=gradientLinear&randomizeIds=true&skinColor=643d19,8c5a2b,a47539,c99c62&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf";
        topThreeUser = topThree[2]?.userImg || "https://api.dicebear.com/9.x/big-smile/svg?seed=Vera&radius=50&backgroundType=gradientLinear&randomizeIds=true&skinColor=643d19,8c5a2b,a47539,c99c62&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf";

    } catch (error) {
        showAlert("Network error. Try again.");
        console.error("Leaderboard Fetch Error:", error);
    }
}

setInterval(() => {
    getLeaderboard(id);
}, 10000);

function updateTournamentUI(result) {
    if (result.type == 'exclusive') {
        const tags = document.querySelector(".tags");
        const tagOne = document.querySelector(".tagOne");
        const tagTwo = document.querySelector(".tagTwo");
        const tagThree = document.querySelector(".tagThree");
        const exclusiveKBD = document.querySelector(".exclusive_count");
        const topThreeImages = document.getElementById("topthree");
        const joinedSection = document.querySelector("._players_joined h5");
        const descParagraph = document.querySelector("._players_joined .desc p");
        const userImgContainer = document.querySelector("._players_joined_user_img");
        const pageHeader = document.getElementById("_tournament_page_header");
        const timer = document.getElementById("time");
        const firstPrize = document.getElementById("firstPrize");
        const secondPrize = document.getElementById("secondPrize");
        const thirdPrize = document.getElementById("thirdPrize");
        document.querySelector(".leaderboard_main").style.marginTop = "335px"
    
        if (joinedSection) {
            joinedSection.textContent = result.tournamentName;
        } else {
            console.warn("Missing: ._players_joined h5");
        }

        if (tagOne) {
            tagOne.textContent = result.tagOne;
        }

        if (tagTwo) {
            tagTwo.textContent = result.tagTwo;
        }

        if (tagThree) {
            tagThree.textContent = result.tagThree;
        }
    
        if (descParagraph) {
            descParagraph.textContent = result.tournamentDesc;
        } else {
            console.warn("Missing: ._players_joined .desc p");
        }

        if (topThreeImages) {
            topThreeImages.innerHTML = `
                <img src="${topOne}" alt=""> 
                <img src="${topTwo}" alt=""> 
                <img src="${topThreeUser}" alt=""> 
            `;
        }
    
        if (timer) {
            if (!document.getElementById(`status-${result._id}`)) {
                timer.innerHTML = `
                    <i id="status-${result._id}"></i>
                    <b id="timer-${result._id}"></b>
                `;
            }
    
            const statusEl = document.getElementById(`status-${result._id}`);
            const timerEl = document.getElementById(`timer-${result._id}`);
            
            if (statusEl) {
                statusEl.textContent = document.getElementById(`status-${result._id}`).innerHTML || '';
            }
            if (timerEl) {
                timerEl.textContent = document.getElementById(`timer-${result._id}`).innerHTML || '';
            }
    
        } else {
            console.warn("Missing: timer");
        }
    
        if (userImgContainer) {
            userImgContainer.setAttribute("data-start-time", result.tournamentStartTime);
            userImgContainer.setAttribute("data-end-time", result.tournamentEndTime);
        } else {
            console.warn("Missing: ._players_joined_user_img");
        }

        if (exclusiveKBD) {
            if (result.maximumPlayers == "" || result.maximumPlayers == "null" || result.maximumPlayers == null) {
                exclusiveKBD.innerHTML = ""; 
            }else{
                exclusiveKBD.innerHTML = `<p class="mt-2"><i class="fi fi-rr-joystick mr-1"></i> <kbd>${result.playerJoinedCount}</kbd> players / ${result.maximumPlayers} joined</p>`;
            }
        }
    
        if (firstPrize) firstPrize.innerHTML = "N" + 0.4 * result.tournamentReward;
        else console.warn("Missing: #firstPrize");
    
        if (secondPrize) secondPrize.innerHTML = "N" + 0.2 * result.tournamentReward;
        else console.warn("Missing: #secondPrize");
    
        if (thirdPrize) thirdPrize.innerHTML = "N" + 0.1 * result.tournamentReward;
        else console.warn("Missing: #thirdPrize");
    
        if (pageHeader) {
            pageHeader.style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, 0) 50%,#0B0C10 100%),url('${result.tournamentImgUrl}')`;
        } else {
            console.warn("Missing: #_tournament_page_header");
        }
    
        joinedUsers(); // if you still want to refresh avatars
        tournamentStatus = result.status;
        entryAmount = result.entryAmount;
        setupTournamentTimer(result._id, result.tournamentStartTime, result.tournamentEndTime);   
    }else{
        const tags = document.querySelector(".tags");
        const exclusiveCount = document.querySelector(".exclusive_count");
        const topThreeImages = document.getElementById("topthree");
        const joinedSection = document.querySelector("._players_joined h5");
        const descParagraph = document.querySelector("._players_joined .desc p");
        const userImgContainer = document.querySelector("._players_joined_user_img");
        const pageHeader = document.getElementById("_tournament_page_header");
        const timer = document.getElementById("time");
        const firstPrize = document.getElementById("firstPrize");
        const secondPrize = document.getElementById("secondPrize");
        const thirdPrize = document.getElementById("thirdPrize");

        tags.style.display = "none";
        exclusiveCount.style.display = "none";
    
        if (joinedSection) {
            joinedSection.textContent = result.tournamentName;
        } else {
            console.warn("Missing: ._players_joined h5");
        }
    
        if (descParagraph) {
            descParagraph.textContent = result.tournamentDesc;
        } else {
            console.warn("Missing: ._players_joined .desc p");
        }

        if (topThreeImages) {
            if (topOne || topTwo || topThreeUser !== undefined) {
                topThreeImages.innerHTML = `
                    <img src="${topOne}" alt=""> 
                    <img src="${topTwo}" alt=""> 
                    <img src="${topThreeUser}" alt=""> 
                `;
            }else{
                topThreeImages.innerHTML = ``;
            }
        }
    
        if (timer) {
            if (!document.getElementById(`status-${result._id}`)) {
                timer.innerHTML = `
                    <i id="status-${result._id}"></i>
                    <b id="timer-${result._id}"></b>
                `;
            }
    
            const statusEl = document.getElementById(`status-${result._id}`);
            const timerEl = document.getElementById(`timer-${result._id}`);
            
            if (statusEl) {
                statusEl.textContent = document.getElementById(`status-${result._id}`).innerHTML || '';
            }
            if (timerEl) {
                timerEl.textContent = document.getElementById(`timer-${result._id}`).innerHTML || '';
            }
    
        } else {
            console.warn("Missing: timer");
        }
    
        if (userImgContainer) {
            userImgContainer.setAttribute("data-start-time", result.tournamentStartTime);
            userImgContainer.setAttribute("data-end-time", result.tournamentEndTime);
        } else {
            console.warn("Missing: ._players_joined_user_img");
        }
    
        if (firstPrize) firstPrize.innerHTML = "N" + 0.4 * result.tournamentReward;
        else console.warn("Missing: #firstPrize");
    
        if (secondPrize) secondPrize.innerHTML = "N" + 0.2 * result.tournamentReward;
        else console.warn("Missing: #secondPrize");
    
        if (thirdPrize) thirdPrize.innerHTML = "N" + 0.1 * result.tournamentReward;
        else console.warn("Missing: #thirdPrize");
    
        if (pageHeader) {
            pageHeader.style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, 0) 50%,#0B0C10 100%),url('${result.tournamentImgUrl}')`;
        } else {
            console.warn("Missing: #_tournament_page_header");
        }
    
        joinedUsers(); // if you still want to refresh avatars
        tournamentStatus = result.status;
        entryAmount = result.entryAmount;
        setupTournamentTimer(result._id, result.tournamentStartTime, result.tournamentEndTime);   
    }
}

function displayWinners(firstWinner, secondWinner, thirdWinner) {
    const tournamentEnd = document.getElementById("tournament_end_content");
    tournamentEnd.innerHTML = ""; // clear first
    const sound = new Audio('./Assets/_sound/mixkit-game-level-completed-2059.wav');

    // winners.forEach(winner => {
    //     const aWinner = document.createElement("div");
    //     aWinner.classList.add('top_three_player');
    //     aWinner.innerHTML = `
    //         <div class="top_three_player">
    //             <div class="t_t_l_user_img_box">
    //                 <div class="_t_t_l_user_img text-center">
    //                     <div class="glow"></div>
    //                     <img src="${winner.userImg}" alt="">
    //                 </div>
    //             </div>
    //             <div class="_t_t_l_user_name">${winner.username}</div>
    //             <div class="_t_t_l_score">
    //                 //<b>Score:</b> ${winner.score}
    //             </div>
    //         </div>
    //     `;
    //     tournamentEnd.appendChild(aWinner);
    // });

    const firstWinner_ = document.createElement("div");
    firstWinner_.classList.add('top_three_player');
    firstWinner_.innerHTML = `
    <div class="top_three_player">
        <div class="t_t_l_user_img_box">
            <div class="_t_t_l_user_img text-center">
                <div class="glow"></div>
                <img src="${firstWinner.userImg}" alt="">
            </div>
        </div>
        <div class="_t_t_l_user_name">${firstWinner.username}</div>
        <div class="_t_t_l_score">
            //<b>Score:</b> ${firstWinner.score}
        </div>
    </div>
    `;

    const secondWinner_ = document.createElement("div");
    secondWinner_.classList.add('top_three_player');
    secondWinner_.innerHTML = `
        <div class="top_three_player">
            <div class="t_t_l_user_img_box">
                <div class="_t_t_l_user_img text-center">
                    <div class="glow"></div>
                    <img src="${secondWinner.userImg}" alt="">
                </div>
            </div>
            <div class="_t_t_l_user_name">${secondWinner.username}</div>
            <div class="_t_t_l_score">
                //<b>Score:</b> ${secondWinner.score}
            </div>
        </div>
    `;

    const thirdWinner_ = document.createElement("div");
    thirdWinner_.classList.add('top_three_player');
    thirdWinner_.innerHTML = `
    <div class="top_three_player">
        <div class="t_t_l_user_img_box">
            <div class="_t_t_l_user_img text-center">
                <div class="glow"></div>
                <img src="${thirdWinner.userImg}" alt="">
            </div>
        </div>
        <div class="_t_t_l_user_name">${thirdWinner.username}</div>
        <div class="_t_t_l_score">
            //<b>Score:</b> ${thirdWinner.score}
        </div>
    </div>
    `;

    tournamentEnd.appendChild(firstWinner_);
    tournamentEnd.appendChild(secondWinner_);
    tournamentEnd.appendChild(thirdWinner_);

    const topPercent = rank ? (rank / playersNumber * 100).toFixed(2) : 0;
    document.getElementById("rankPercent").innerHTML = `You are among the top ${topPercent}% at rank ${rank}`;
    document.getElementById("tournament_end").style.display = "flex";
    sound.play();
}

function showAlert(message) {
    const alert = document.createElement("div");
    alert.classList.add('alert', 'alertDanger', 'alert-dismissible', 'fade', 'show');

    alert.innerHTML = `
        <i class="fi fi-rr-exclamation"></i> ${message}!
        <button type="button" class="close" data-dismiss="alert">&times;</button>
    `;

    mainAlert.appendChild(alert);
}

async function startTournamentRefetching() {
    while (true) {
        await refetching();
        if (!addUserRequest) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            setTimeout(() => {
                document.querySelector("main").style.display = "block";
                document.getElementById("loader").style.display = "none";
            }, 2000);   
        }
    }
}

startTournamentRefetching();

async function addUserToTournament() {
    if (addUserRequest) return;
    addUserRequest = true;
    try {

        document.querySelector(".joinDiv").innerHTML = `
            <span class="spinner-border spinner-border-sm mr-1">
        `;
        const response = await fetch(`${API_BASE_URL}/join_tournament?userid=${userId}&id=${id}`)
        const result = await response.json();

        if (!response.ok) {
            const alert = document.createElement("div");
            alert.classList.add('alert');
            alert.classList.add('alertDanger');
            alert.classList.add('alert-dismissible');
            alert.classList.add('fade');
            alert.classList.add('show');

            alert.innerHTML = `
               <i class="fi fi-rr-exclamation"></i> ${result.message}!
                <button type="button" class="close" data-dismiss="alert">&times;</button>
            `;

            mainAlert.appendChild(alert);
            document.getElementById("joinBtn").innerHTML = `
                 <a class="btn mb-1" id="join_btn" onclick="addUserToTournament()">
                    <div class="d-flex">
                        <div class="pointDiv">100 pts</div>
                        <div class="joinDiv">Join</div>
                    </div>
                </a>
            `;
            console.log(result.message)
        }else{
            addUserRequest = false;
            startTournamentRefetching();
        }
        
    } catch (error) {
        
    }
}

async function joinedUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/joined_users?id=${id}`)
        const result = await response.json();

        if (!response.ok) {
            console.log(result.message);
        }else{
            console.log("Player Number:", result)
            document.getElementById("_players_numbers").innerHTML = `
                +${result} players joined
            `;
        }

    } catch (error) {
        
    }
} 

async function checkIfUserIsJoined(status, id, entryfee, playUrl) {
    try {
        const response = await fetch(`${API_BASE_URL}/check_user_is_joined?userId=${userId}&id=${id}`)
        const result = await response.json();

        if (!response.ok) {
            const alert = document.createElement("div");
            alert.classList.add('alert', 'alertDanger', 'alert-dismissible', 'fade', 'show');
            alert.innerHTML = `
                <i class="fi fi-rr-exclamation"></i> ${result.message}!
                <button type="button" class="close" data-dismiss="alert">&times;</button>
            `;
            mainAlert.appendChild(alert);
            console.log(result.message);
        }

        const checker = result.message;
        const joinBtn = document.getElementById("joinBtn");
        const playBtn = document.getElementById("play_btn");

        if (checker === 'joined') {
            const joinedHTML = `
                <div class="active d-flex justify-content-center">
                    <a class="btn mb-1 joined_btn">
                        <div class="d-flex">
                            <div class="pointDiv">${entryfee} <img src="./Assets/_icons/coin.png" width="20px" class="" alt=""> </div>
                            <div class="joinDiv text-dark">Joined</div>
                        </div>
                    </a>
                </div>
            `;

            if (joinBtn && joinBtn.innerHTML.trim() !== joinedHTML.trim()) {
                joinBtn.innerHTML = joinedHTML;
            }

            const playGameHref = playUrl+`?id=${id}`;
            const activePlayHTML = `<a class="btn play_btn" href="${playGameHref}">Play Game</a>`;
            const disabledPlayHTML = `<a class="btn play_btn disabled">Play Game</a>`;

            if (playBtn) {
                const expectedPlayHTML = (status === 'active') ? activePlayHTML : disabledPlayHTML;
                if (playBtn.innerHTML.trim() !== expectedPlayHTML.trim()) {
                    playBtn.innerHTML = expectedPlayHTML;
                }
            }

        } else if (checker === 'notJoined') {
            const notJoinedHTML = `
                <a class="btn mb-1" id="join_btn" onclick="addUserToTournament()">
                    <div class="d-flex">
                        <div class="pointDiv">${entryfee} <img src="./Assets/_icons/coin.png" width="20px" class="" alt=""> </div>
                        <div class="joinDiv">Join</div>
                    </div>
                </a>
            `;

            if (joinBtn && joinBtn.innerHTML.trim() !== notJoinedHTML.trim()) {
                joinBtn.innerHTML = notJoinedHTML;
            }

            if (playBtn && playBtn.innerHTML.trim() !== `<a class="btn play_btn disabled">Play Game</a>`) {
                playBtn.innerHTML = `<a class="btn play_btn disabled">Play Game</a>`;
            }
        }
    } catch (error) {
        console.error("Error checking if user is joined:", error);
    }
}

async function share() {
    const title = document.querySelector('._players_joined h5').innerHTML;
    if (navigator.share) {
        try {
          await navigator.share({
            title: `${title}`,
            text: 'Join me on Octagames! Let\'s play, have fun, and win real cash prizes together!',
            url: window.location.href,
          });
          console.log('Thanks for sharing!');
        } catch (error) {
          console.log('Sharing failed', error);
        }
      } else {
        alert('Share not supported in this browser.');  // For desktop fallback
    }
}