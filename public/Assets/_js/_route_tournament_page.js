const userId = sessionStorage.getItem("userid");
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const tag = urlParams.get("tag");

var topOne;
var topTwo;
var topThree;
var rank;
var playersNumber;

async function addUserToTournament() {
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
            document.querySelector(".joinDiv").innerHTML = `
                Join
            `;
            console.log(result.message)
        }else{
            console.log(result);
        }
        
    } catch (error) {
        
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/getLeaderboard?Id=${id}`);

        if (!response.ok) {
            const error = await response.json();
            const alert = document.createElement("div");
            alert.classList.add('alert');
            alert.classList.add('alertDanger');
            alert.classList.add('alert-dismissible');
            alert.classList.add('fade');
            alert.classList.add('show');

            alert.innerHTML = `
               <i class="fi fi-rr-exclamation"></i> ${error.message}!
                <button type="button" class="close" data-dismiss="alert">&times;</button>
            `;

            mainAlert.appendChild(alert);
            console.log("API Error:", error.message || "Unknown error");
            return;
        }

        const players = await response.json();
        playersNumber = players.number

        if (players.leaderboard.length < 1) {
            document.querySelector("table").innerHTML = `
                <div class="_empty">
                    <h6>No player has <b>joined tournament</b> yet</h6>
                </div>
            `;
        }else{
            console.log("Fetched Players:", players.leaderboard); 
            const leaderboardTable = document.querySelector("#leaderboardTable tbody");
            players.leaderboard.forEach((player, index) => {
                const row = document.createElement("tr");
                row.id = `${player.userId}`;
                var status = `<i class="fi fi-rr-angles-up-down text-warning"></i>`;

                if (row.id == userId) {
                    // row.style.border = "2px solid #ffc107";
                    row.style.color = "#66FCF1";  
                    row.style.fontWeight = "600"      
                    rank = index + 1;
                    const previousRank = sessionStorage.getItem(player.leaderboardId);
                    if (!previousRank) {
                       sessionStorage.setItem(player.leaderboardId, rank)
                    }else{
                        if (previousRank > rank) {
                            status = `<i class="fi fi-rr-caret-up text-success"></i>`;
                            sessionStorage.setItem(player.leaderboardId, rank)
                        }
                        if(previousRank == rank){
                            status = `<i class="fi fi-rr-menu-dots"></i>`;
                        }
                        else{
                            status = `<i class="fi fi-rr-caret-down text-danger"></i>`;
                            sessionStorage.setItem(player.leaderboardId, rank)
                        }
                    }
                    
                }

                row.innerHTML = `
                    <td>${status}</td>
                    <td>${index + 1}</td>
                    <td class="d-flex"><img src="${player.userImg}" class="img-fluid mr-1" alt="user-pic" width="15px"> ${player.username}</td>
                    <td>${player.played}</td>
                    <td>${player.score}</td>
                    <td></td>
                `;
            
                leaderboardTable.appendChild(row);
            });

            const topThree = players.leaderboard.slice(0, 3);
            topOne = topThree[0].userImg;
            topTwo = topThree[1].userImg;
            topThree = topThree[2].userImg;
        }
    } catch (error) {    
    }

    try {
        const response = await fetch(`${API_BASE_URL}/tournament_page?Id=${id}&tag=${tag}`)
        const result = await response.json();

        if (!response.ok) {
            console.log(result.message);
            console.log(result)
            if (result.status == 'ended') {
                try {
                    const response = await fetch(`${API_BASE_URL}/tournament_winners?id=${id}`);
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
                        console.log(result.message)
                        window.location.href = "index.html";
                    }else{
                        const tournamentEnd = document.getElementById("tournament_end_content");
                        const sound = new Audio('./Assets/_sound/mixkit-game-level-completed-2059.wav');
                        result.forEach(winner => {
                            const aWinner = document.createElement("div");
                            aWinner.classList.add('top_three_player');

                            aWinner.innerHTML = `
                                <div class="top_three_player">
                                    <div class="t_t_l_user_img_box">
                                        <div class="_t_t_l_user_img text-center">
                                            <div class="glow"></div>
                                            <img src="${winner.userImg}" alt="">
                                        </div>
                                    </div>
                                    <div class="_t_t_l_user_name">
                                       ${winner.username}
                                    </div>
                                    <div class="_t_t_l_score">
                                        <b>Score:</b> ${winner.score}
                                        <b>N3000</b>
                                    </div>
                                </div>
                            `;

                            tournamentEnd.appendChild(aWinner);
                        });
                        
                        if (rank == undefined) {
                            rank = 0;
                        }
                        const topPercent = rank / playersNumber * 100;
                        document.getElementById("rankPercent").innerHTML = `You are among the top ${topPercent}% at rank ${rank}`;
                        document.getElementById("tournament_end").style.display = "flex";
                        sound.play();
                    }
                } catch (error) {
                    
                }
            }
        }else{
            const _players_joined = document.getElementById("_players_joined");
            if (result.type == 'exclusive') {
                const tagOne = result.tagOne;
                const tagTwo = result.tagTwo;
                const tagThree = result.tagThree;
                var tagBox = `
                    <div class="mb-2">
                        <span class="badge">${tagOne}</span>
                        <span class="badge">${tagTwo}</span>
                        <span class="badge">${tagThree}</span>
                    </div>
                `;
                var avaliableSlot = `
                    <div>
                        <p class="mt-2"><i class="fi fi-rr-joystick mr-1"></i> <kbd>${result.playerJoinedCount}</kbd> players / 100 joined</p>
                    </div>
                `;
            }
            _players_joined.innerHTML = `
                <div class="_players_joined">
                    <h5>${result.tournamentName}</h5>
                    ${tagBox}
                    <div class="desc">
                     <h6>Description</h6>
                     <p>${result.tournamentDesc}</p>
                    </div>
                    <div class="_players_joined_user_img" data-start-time="${result.tournamentStartTime}" data-end-time="${result.tournamentEndTime}">
                        <i class="topThree" id="topthree">
                            <img src="${topOne}" alt="">
                            <img src="${topTwo}" alt="">
                            <img src="${topThree}" alt="">
                        </i>
                        <span class="_players_numbers" id="_players_numbers">
                        </span>
                        <span class="float-right mr-2">
                            <i id="status-${result._id}"></i>
                            <b id="timer-${result._id}"></b>
                        </span>
                        ${avaliableSlot}
                        <div class="reward mt-3">
                            <div class="reward_box_">
                                <div class="d-flex justify-content-center mb-3">
                                    <img src="./Assets/_icons/2nd-place.png" width="30px" alt="">
                                </div>
                                <h5 id="secondPrize"></h5>
                                <h6>2nd Place Prize</h6>
                            </div>
                            <div class="reward_box_">
                                <div class="d-flex justify-content-center mb-3">
                                    <img src="./Assets/_icons/1st-prize.png" width="30px" alt="">
                                </div>
                                <h5 id="firstPrize"></h5>
                                <h6>1st Place Prize</h6>
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
            joinedUsers();
            checkIfUserIsJoined(result.status, result._id, result.entryAmount);
            setupTournamentTimer(result._id, result.tournamentStartTime, result.tournamentEndTime);

            const prize = result.tournamentReward;
            const firstPrize = document.getElementById("firstPrize");
            const secondPrize = document.getElementById("secondPrize");
            const thirdPrize = document.getElementById("thirdPrize");
            const pageHeader = document.getElementById("_tournament_page_header");

            pageHeader.style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, 0) 50%,#0B0C10 100%),url('${result.tournamentImgUrl}')`;
            firstPrize.innerHTML = "N" + 0.4 * prize;
            secondPrize.innerHTML = "N" + 0.2 * prize;
            thirdPrize.innerHTML = "N" + 0.1 * prize;

            firstPrize.style.color = "#fff";
            secondPrize.style.color = "#fff";
            thirdPrize.style.color = "#fff";
        }
        
    } catch (error) {
        
    }
})

async function joinedUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/joined_users?id=${id}`)
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
            console.log(result.message);
        }

        var playersnumber;
        if (result < 4) {
            playersnumber = 0;
            document.getElementById("_players_numbers").innerHTML = `
                +${playersnumber} players joined & waiting
            `;
        }else{
            var playersnumber = result - 3;
            document.getElementById("_players_numbers").innerHTML = `
                +${playersnumber} players joined & waiting
            `;
        }

    } catch (error) {
        
    }
} 

async function checkIfUserIsJoined(status, id, entryfee) {
    try {
        const response = await fetch(`${API_BASE_URL}/check_user_is_joined?userId=${userId}&id=${id}`)
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
            console.log(result.message);
        }

        const checker = result.message;
        console.log(result.message);
        
        if (checker == 'joined') {
            document.getElementById("joinBtn").innerHTML = `
                <div class="active d-flex justify-content-center">
                    <a class="btn mb-1 joined_btn">
                        <div class="d-flex">
                            <div class="pointDiv">${entryfee} pts</div>
                            <div class="joinDiv">Joined</div>
                        </div>
                    </a>
                </div>
            `;
            if (status == 'active') {
                document.getElementById('play_btn').innerHTML = `
                    <a class="btn play_btn" href="./Assets/_games/_games/subwaysurfersny/?id=${id}">Play Game</a>
                `;   
            }else{
                document.getElementById('play_btn').innerHTML = `
                    <a class="btn play_btn disabled">Play Game</a>
                `;  
            }
        }if (checker == 'notJoined') {
            document.getElementById("joinBtn").innerHTML = `
                <a class="btn mb-1" onclick="addUserToTournament()">
                    <div class="d-flex">
                        <div class="pointDiv">${entryfee} pts</div>
                            <div class="joinDiv">Join</div>
                    </div>
                </a>
            `;
            document.getElementById('play_btn').innerHTML = `
                <a class="btn play_btn disabled">Play Game</a>
            `;
        }
    } catch (error) {
        
    }
}
