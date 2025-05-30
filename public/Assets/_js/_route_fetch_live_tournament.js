document.querySelector("main").style.display = "none";
const userId = sessionStorage.getItem("userid");
document.addEventListener('DOMContentLoaded', async () => {
    if (document.querySelector("._top_three_box")) {
        topPlayers();
    }
    fetchAndDisplayTournaments();
}) 

async function topPlayers() {
    const response = await fetch(`${API_BASE_URL}/fetch_top_player`);
    const result = await response.json();
    const topPlayersBox = document.querySelector("._top_three_box");

    if (!response.ok) {
        const alert = document.createElement("div");
        alert.classList.add('alert', 'alertDanger', 'alert-dismissible', 'fade', 'show');
        alert.innerHTML = `
            <i class="fi fi-rr-exclamation"></i> ${tournaments.message}!
            <button type="button" class="close" data-dismiss="alert">&times;</button>
        `;
        mainAlert.appendChild(alert);
    }else{
        console.log(result)
        let topPlayerOne = result[0];
        let topPlayerTwo = result[1];
        let topPlayerThree = result[2];
        let topPlayerFour = result[3];
        let topPlayerFive = result[4];

        if (topPlayerOne) {
            const topOneUserImg = document.querySelector("._tp_one .player_info").innerHTML = `
                <img class="mx-auto d-block" src="${topPlayerOne.userImg}" alt="">
                <h5>${topPlayerOne.username}</h5>
            `;
        }
 
        if (topPlayerTwo) {
            const topUser = document.querySelector("._tp_two .player_info").innerHTML = `
                <img class="mx-auto d-block" src="${topPlayerTwo.userImg}" alt="">
                <h5>${topPlayerTwo.username}</h5>
            `;
        }else{
            document.querySelector("._tp_two").style.display = "none";
        }

        if (topPlayerThree) {
            const topUser = document.querySelector("._tp_three").innerHTML = `
                <img class="mx-auto d-block" src="${topPlayerThree.userImg}" alt="">
                <h5>${topPlayerThree.username}</h5>
            `;
        }
            else{
                document.querySelector("._tp_three").style.display = "none";
            }
    }
}

async function fetchAndDisplayTournaments() {
    const promises = []; 

    const exclusiveTournament = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/fetch_exclusive_tournaments`);
            const tournaments = await response.json();

            if (!response.ok) {
                const alert = document.createElement("div");
                alert.classList.add('alert', 'alertDanger', 'alert-dismissible', 'fade', 'show');
                alert.innerHTML = `
                    <i class="fi fi-rr-exclamation"></i> ${tournaments.message}!
                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                `;
                mainAlert.appendChild(alert);
            }

            const liveTournamentContainer = document.getElementById('_exclusive_box');

            if (liveTournamentContainer) {
                // Create a temporary wrapper div for new content
                const tempContainer = document.createElement("div");

                tournaments.forEach(tournament => {
                    const tournamentDiv = document.createElement('div');
                    const maximumPlayers = tournament.maximumPlayers;
                    let text;
                    if (maximumPlayers == "" || maximumPlayers == "null" || maximumPlayers == null) {
                        text = ""
                    }else{
                        text = `<p class="mt-2"><i class="fi fi-rr-joystick mr-1"></i> <kbd>${tournament.playerJoinedCount}</kbd> players / ${tournament.maximumPlayers} joined</p>`;
                    }
                    tournamentDiv.innerHTML = `
                        <div class="_exclusive" data-start-time="${tournament.tournamentStartTime}" data-end-time="${tournament.tournamentEndTime}" data-tournament-id="${tournament._id}">
                            <div class="_game_img exclusiveGameImg"></div>
                            <div class="pt-2 pl-3 pr-3 pb-2">
                                <div class="_game_name">
                                    <h6>${tournament.tournamentName}</h6> 
                                </div>
                                <div class="mb-2">
                                    <span class="badge">${tournament.tagOne}</span>
                                    <span class="badge">${tournament.tagTwo}</span>
                                    <span class="badge">${tournament.tagThree}</span>
                                </div>
                                <div class="_game_desc">
                                    <p class="mb-2"><span id="status-${tournament._id}">Ends in: </span><b id="timer-${tournament._id}">--:--</b></p>
                                    <div class="_game_win_amount">
                                        <span>${tournament.tournamentDesc}</span>
                                        Reward: <b>N40,000</b> 
                                    </div>
                                    <a href="" class=""><i class="fi fi-rr-info"></i> How it works?</a>
                                </div>
                                <div class="_game_player_join">
                                    <div class="_player_joined mb-2">
                                        ${text}
                                    </div>
                                    <a href="./tournament_page.html?id=${tournament._id}&tag=live" class="btn mb-1">
                                        <div class="d-flex">
                                            <div class="pointDiv">
                                            <img src="./Assets/_icons/coin.png" width="20px" class="" alt="">
                                            ${tournament.entryAmount}
                                            </div>
                                            <div class="joinDiv">Open</div>
                                        </div>
                                    </a>
                                </div>             
                            </div>
                        </div>
                    `;

                    const gameImg = tournamentDiv.querySelector(".exclusiveGameImg");
                    gameImg.style.background = `linear-gradient(to bottom, rgba(0, 0, 0, 0) 70%, #1F2833 100%), url('${tournament.tournamentImgUrl}')`;

                    tempContainer.appendChild(tournamentDiv);
                });

                // Once all is ready, replace the old content with the new one
                liveTournamentContainer.innerHTML = ""; // Clear old content
                liveTournamentContainer.innerHTML = tempContainer.innerHTML; // Add new content

                tournaments.forEach(tournament => {
                    setupTournamentTimer(tournament._id, tournament.tournamentStartTime, tournament.tournamentEndTime);
                });   
            }
            
        } catch (error) {
            console.error('Error fetching tournament:', error);
        }
    }

    const liveTournament = async () => {    
        try {
            const response = await fetch(`${API_BASE_URL}/fetch_live_tournaments?userid=${userid}`)
            const tournaments = await response.json();

            if (!response.ok) {
                const alert = document.createElement("div");
                alert.classList.add('alert');
                alert.classList.add('alertDanger');
                alert.classList.add('alert-dismissible');
                alert.classList.add('fade');
                alert.classList.add('show');

                alert.innerHTML = `
                <i class="fi fi-rr-exclamation"></i> ${tournaments.message}!
                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                `;

                mainAlert.appendChild(alert);
                throw new Error('Failed to fetch tournament');
            }

            const liveTournamentContainer = document.getElementById('_tournamentLive');
            if (liveTournamentContainer) {
                // Create a temporary wrapper div for new content
                const tempContainer = document.createElement("div");

                tournaments.livetournament.forEach(tournament => {
                    const tournamentDiv = document.createElement('div');
                    tournamentDiv.innerHTML = `
                        <div class="_tournament_box" data-start-time="${tournament.tournamentStartTime}" data-end-time="${tournament.tournamentEndTime}"  data-tournament-id="${tournament._id}">
                                    <div class="_game_img">
                                        <img src="${tournament.tournamentImgUrl}" alt="">
                                    </div>
                                    <div class="p-2">
                                        <div class="_game_name">
                                            <h6>${tournament.tournamentName} <span class="badge">New!</span></h6>
                                        </div>
                                        <div class="_game_desc">
                                            <p class="mb-2"><span id="status-${tournament._id}">Starts in:</span> <b id="timer-${tournament._id}">--:--</b></p>
                                            <div class="_game_win_amount">Reward: N10,000</div>
                                            <a class="" onclick="howItWorks('${tournament.tournamentName}')"><i class="fi fi-rr-info"></i> How to Win</a>
                                        </div>
                                        <div class="_game_player_join">
                                            <div class="_player_joined mb-2"></div>
                                            <a href="./tournament_page.html?id=${tournament._id}&tag=live" class="btn mb-1">
                                                <div class="d-flex">
                                                    <div class="pointDiv">                                                                                
                                                    <img src="./Assets/_icons/coin.png" width="20px" class="" alt="">
                                                    100
                                                    </div>
                                                    <div class="joinDiv">${tournament.message}</div>
                                                </div>
                                            </a>                                
                                        </div>
                                    </div>
                                </div>
                    `;

                    tempContainer.appendChild(tournamentDiv);
                }) ;

                // Once all is ready, replace the old content with the new one
                liveTournamentContainer.innerHTML = ""
                liveTournamentContainer.innerHTML = tempContainer.innerHTML;
                
                tournaments.livetournament.forEach(tournament => {
                    setupTournamentTimer(tournament._id, tournament.tournamentStartTime, tournament.tournamentEndTime);
                });   
            }
        }
        catch (error) {
            console.error('Error fetching tournament:', error); 
        }
    }

    const upcomingTournaments = async () => {   
        try {
            const response = await fetch(`${API_BASE_URL}/fetch_upcoming_tournaments?userid=${userid}`)
            const tournaments = await response.json();

            if (!response.ok) {
                const alert = document.createElement("div");
                alert.classList.add('alert');
                alert.classList.add('alertDanger');
                alert.classList.add('alert-dismissible');
                alert.classList.add('fade');
                alert.classList.add('show');

                alert.innerHTML = `
                <i class="fi fi-rr-exclamation"></i> ${tournaments.message}!
                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                `;

                mainAlert.appendChild(alert);
                throw new Error('Failed to fetch tournament');
            }

            const liveTournamentContainer = document.getElementById('_tournamentUpcoming');
            // Once all is ready, replace the old content with the new one
            if (liveTournamentContainer) {
                // Create a temporary wrapper div for new content
                const tempContainer = document.createElement("div");

                tournaments.livetournament.forEach(tournament => {
                    const tournamentDiv = document.createElement('div');
                    tournamentDiv.innerHTML = `
                        <div class="_tournament_box" data-start-time="${tournament.tournamentStartTime}" data-end-time="${tournament.tournamentEndTime}"  data-tournament-id="${tournament._id}">
                                    <div class="_game_img">
                                        <img src="${tournament.tournamentImgUrl}" alt="">
                                    </div>
                                    <div class="p-2">
                                        <div class="_game_name">
                                            <h6>${tournament.tournamentName} <span class="badge">New!</span></h6>
                                        </div>
                                        <div class="_game_desc">
                                            <p class="mb-2"><span id="status-${tournament._id}">Starts in:</span> <b id="timer-${tournament._id}">--:--</b></p>
                                            <div class="_game_win_amount">Reward: N10,000</div>
                                            <a class="" onclick="howItWorks('${tournament.tournamentName}')"><i class="fi fi-rr-info"></i> How to Win</a>
                                        </div>
                                        <div class="_game_player_join">
                                            <div class="_player_joined mb-2"></div>
                                            <a href="./tournament_page.html?id=${tournament._id}&tag=live" class="btn mb-1">
                                                <div class="d-flex">
                                                    <div class="pointDiv">
                                                    <img src="./Assets/_icons/coin.png" width="20px" class="" alt="">
                                                    100
                                                    </div>
                                                    <div class="joinDiv">${tournament.message}</div>
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                    `;

                    tempContainer.appendChild(tournamentDiv);        
                }); 

                liveTournamentContainer.innerHTML = ""
                liveTournamentContainer.innerHTML = tempContainer.innerHTML;
                tournaments.livetournament.forEach(tournament => {
                    setupTournamentTimer(tournament._id, tournament.tournamentStartTime, tournament.tournamentEndTime);
                });       
            }
        }
        catch (error) {
            console.error('Error fetching tournament:', error); 
        }
    }

    const activeTournament = async () => { 
        try {
            const response = await fetch(`${API_BASE_URL}/fetch_active_tournament?userid=${userId}`);
            const tournaments = await response.json();
            const activeTournamentBox = document.getElementById('_tournamentActive');

            if (!response.ok) {
                const alert = document.createElement("div");
                alert.classList.add('alert');
                alert.classList.add('alertDanger');
                alert.classList.add('alert-dismissible');
                alert.classList.add('fade');
                alert.classList.add('show');

                alert.innerHTML = `
                <i class="fi fi-rr-exclamation"></i> ${tournaments.message}!
                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                `;

                mainAlert.appendChild(alert);
                console.log(tournaments.message);
            }
            
            const timerCount = sessionStorage.setItem("open_tournaments", tournaments.length);
            const activeNumber = sessionStorage.getItem("open_tournaments")
            if (activeNumber) {
                document.querySelector(".active_count").style.background = "#000";
                document.querySelector(".active_count").innerHTML = activeNumber;
            }

            if (tournaments.length == 0) {
                console.log(tournaments);
                activeTournamentBox.innerHTML = `
                    <div class="_empty">
                        <h6>You have no <b>active / joined</b> tournament</h6>
                    </div>
                `;
                return;
            }

            // Create a temporary wrapper div for new content
            const tempContainer = document.createElement("div");
            
            tournaments.forEach(tournament => {
                const tournamentDiv = document.createElement('div');
                tournamentDiv.innerHTML = `
                    <div class="_active_tournament" data-start-time="${tournament.tournament.tournamentStartTime}" data-end-time="${tournament.tournament.tournamentEndTime}"  data-tournament-id="${tournament.tournament._id}">
                        <div class="_game_img">
                            <img src="${tournament.tournament.tournamentImgUrl}" alt="">
                        </div>
                        <div class="pt-2 pl-3 pr-3 pb-2">
                            <div class="_game_name">
                                <h6>${tournament.tournament.tournamentName}<span class="ml-1 badge badge-success">Active!</span></h6>
                            </div>
                            <div class="_game_desc">
                                <p class="mb-2"><span id="status-${tournament.tournament._id}">Ends in: </span><b id="timer-${tournament.tournament._id}">--:--</b></p>
                                <div class="_game_win_amount">Reward: <b>N${tournament.tournament.tournamentReward}</b></div>
                                <a class=""  onclick="howItWorks('${tournament.tournament.tournamentName}')"><i class="fi fi-rr-info"></i> How to Win</a>
                            </div>
                            <div class="_game_player_join">
                                <div class="_player_joined mb-2">
                                    <!-- <p class="mt-2">78 players</p> -->
                                </div>
                                <a href="./tournament_page.html?id=${tournament.tournament._id}&tag=live" class="btn mb-1">
                                    <div class="d-flex">
                                        <div class="pointDiv">
                                            <img src="./Assets/_icons/coin.png" width="20px" class="" alt="">
                                            100
                                        </div>
                                        <div class="joinDiv">Open</div>
                                    </div>
                                </a>
                            </div>             
                        </div>
                    </div>
                `;

                tempContainer.appendChild(tournamentDiv);        
            }); 

            // Once all is ready, replace the old content with the new one
            activeTournamentBox.innerHTML = ""
            activeTournamentBox.innerHTML = tempContainer.innerHTML;
            tournaments.forEach(tournament => {
                setupTournamentTimer(tournament.tournament._id, tournament.tournament.tournamentStartTime, tournament.tournament.tournamentEndTime);
            });        
        } catch (error) {
            
        }
    }

    const myTournament = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/get_reward_info?userid=${userid}`);
            const tournaments = await response.json();
            const myTournamentBox = document.getElementById('_myTournament');

            if (!response.ok) {
                const alert = document.createElement("div");
                alert.classList.add('alert');
                alert.classList.add('alertDanger');
                alert.classList.add('alert-dismissible');
                alert.classList.add('fade');
                alert.classList.add('show');

                alert.innerHTML = `
                <i class="fi fi-rr-exclamation"></i> ${tournaments.message}!
                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                `;

                mainAlert.appendChild(alert);
                console.log(tournaments.message);
            }

            if (tournaments.length == 0) {
                console.log(tournaments);
                activeTournamentBox.innerHTML = `
                    <div class="_empty">
                        <h6>You have no <b>tournament</b> record yet</h6>
                    </div>
                `;
                return;
            }

            // Create a temporary wrapper div for new content
            const tempContainer = document.createElement("div");
            
            tournaments.forEach(tournament => {
                const tournamentDiv = document.createElement('div');

                const isoDate = tournament.gameDateTime;
                const date = new Date(isoDate);
                const readableDate = date.toLocaleString();

                tournamentDiv.innerHTML = `
                    <div class="_active_tournament">
                        <div class="_game_img">
                            <img src="${tournament.gameImg}" alt="">
                        </div>
                        <div class="pt-2 pl-3 pr-3 pb-2">
                            <div class="_game_name">
                                <h6>${tournament.gameName}</h6>
                            </div>
                            <div class="_game_desc">
                                <div class="_game_win_amount">
                                    Reward: <b>N${tournament.gameReward}</b>
                                    <br/>
                                    <text class="mb-2"><b>${readableDate}</b></text>
                                </div>
                            </div>
                            <div class="_game_player_join">
                                <div class="_player_joined mb-2">
                                    <!-- <p class="mt-2">78 players</p> -->
                                </div>
                                <a href="./tournament_page.html?id=${tournament.gameId}&tag=live" class="btn mb-1">
                                    <div class="d-flex">
                                        <div class="pointDiv">
                                            Ended
                                        </div>
                                        <div class="joinDiv">Open</div>
                                    </div>
                                </a>
                            </div>             
                        </div>
                    </div>
                `;

                tempContainer.appendChild(tournamentDiv);        
            }); 

            // Once all is ready, replace the old content with the new one
            myTournamentBox.innerHTML = ""
            myTournamentBox.innerHTML = tempContainer.innerHTML;    
        } catch (error) {
            
        }
    }

    promises.push(exclusiveTournament(), liveTournament(), upcomingTournaments(), activeTournament(), myTournament());
    await Promise.all(promises);
    setTimeout(() => {
        document.querySelector("main").style.display = "block";
        document.getElementById("loader").style.display = "none";
        setInterval(fetchAndDisplayTournaments, 60 * 1000);
    }, 3000);

}

async function howItWorks(name) {
    const gamename = name;
    const howtowincontainer = document.querySelector(".how_to_win_container");
    howtowincontainer.innerHTML = `
        <div class="how_to_win_box">
            <h5>How to win: ${gamename}</h5>
            <p>
                Ready to rise to the top? Compete in the ${gamename} tournament, climb the leaderboard, and win awesome cash prizes.
            </p>
            <a href="">Click here to learn more about ${gamename}</a>
            <div class="steps mt-1">
                <div class="step">
                    <div class="d-flex justify-content-center">
                        <span>
                            1
                        </span>
                    </div>
                    <div class="ml-1">
                        <h6>Join Tournament</h6>
                        <p>
                            Tap the Join button to enter the ${gamename} tournament. You’ll be redirected to the tournament page – your gateway to the competition!                                    
                        </p>
                    </div>
                </div>
                <div class="step">
                    <div class="d-flex justify-content-center">
                        <span>
                            2
                        </span>
                    </div>
                    <div class="ml-1">
                        <h6>Play Game</h6>
                        <p>
                            Once you're in, hit Play on the tournament page to launch the game. Play as many times as you like to improve your score before the time runs out!
                        </p>
                    </div>
                </div>
                <div class="step">
                    <div class="d-flex justify-content-center">
                        <span>
                            3
                        </span>
                    </div>
                    <div class="ml-1">
                        <h6>Don't Stop!!</h6>
                        <p>
                            Keep grinding and aim for that top spot on the leaderboard. Every run gets you closer to victory and amazing rewards!                                    
                        </p>
                    </div>
                </div>
            </div>
            <button class="btn w-100" onclick="closeHowToWin()">Got It!</button>
        </div>
    `;
    howtowincontainer.style.display = "flex";
}

function closeHowToWin() {
    const howtowincontainer = document.querySelector(".how_to_win_container");
    howtowincontainer.innerHTML = "";
    howtowincontainer.style.display = "none";
}

function scrollLeftBtn(scrollContainer) {
    const scrollContainerHTMl = document.getElementById(`${scrollContainer}`);
    scrollContainerHTMl.scrollBy({ left: -200, behavior: 'smooth' }); // scroll left
}

function scrollRightBtn(scrollContainer) {
    const scrollContainerHTMl = document.getElementById(`${scrollContainer}`);
    scrollContainerHTMl.scrollBy({ left: 200, behavior: 'smooth' }); // scroll right  
}