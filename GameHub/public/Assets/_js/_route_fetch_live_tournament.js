// const API_BASE_URL = 'http://localhost:3000';
const userId = sessionStorage.getItem("userid");

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/fetch_exclusive_tournaments`)
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
        console.log('Live Tournament:', tournaments);
        const liveTournamentContainer = document.getElementById('_exclusive_box');
        tournaments.forEach(tournament => {
            const tournamentDiv = document.createElement('div');
            tournamentDiv.innerHTML = `
                <div class="_exclusive" data-start-time="${tournament.tournamentStartTime}" data-end-time="${tournament.tournamentEndTime}"  data-tournament-id="${tournament._id}">
                    <div class="_game_img exclusiveGameImg">
                    </div>
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
                                <p class="mt-2"><i class="fi fi-rr-joystick mr-1"></i> <kbd>${tournament.playerJoinedCount}</kbd> players / 100 joined</p>
                            </div>
                            <a href="./tournament_page.html?id=${tournament._id}&tag=live" class="btn mb-1">
                                <div class="d-flex">
                                    <div class="pointDiv">${tournament.entryAmount} pts</div>
                                     <div class="joinDiv">Open</div>
                                </div>
                            </a>
                        </div>             
                    </div>
                </div>
            `;

            liveTournamentContainer.appendChild(tournamentDiv);
            document.querySelectorAll(".exclusiveGameImg").forEach((el) => {
                el.style.background = `linear-gradient(to bottom, rgba(0, 0, 0, 0) 70%, #1F2833 100%), url('${tournament.tournamentImgUrl}')`;
            });
            setupTournamentTimer(tournament._id, tournament.tournamentStartTime, tournament.tournamentEndTime);
        
        }) 
    }
    catch (error) {
        console.error('Error fetching tournament:', error); 
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/fetch_live_tournaments`)
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
        console.log('Live Tournament:', tournaments);
        const liveTournamentContainer = document.getElementById('_tournamentLive');
        tournaments.forEach(tournament => {
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
                                    <div class="_game_win_amount">Reward: N${tournament.tournamentReward}</div>
                                    <a href="" class=""><i class="fi fi-rr-info"></i> How to Win</a>
                                </div>
                                <div class="_game_player_join">
                                    <div class="_player_joined mb-2"></div>
                                    <a href="./tournament_page.html?id=${tournament._id}&tag=live" class="btn mb-1">
                                        <div class="d-flex">
                                            <div class="pointDiv">100 pts</div>
                                            <div class="joinDiv">Join</div>
                                        </div>
                                    </a>                                
                                </div>
                            </div>
                        </div>
            `;

            liveTournamentContainer.appendChild(tournamentDiv);
            setupTournamentTimer(tournament._id, tournament.tournamentStartTime, tournament.tournamentEndTime);
        
        }) 
    }
    catch (error) {
        console.error('Error fetching tournament:', error); 
    }

    try {
        const response = await fetch(`${API_BASE_URL}/fetch_upcoming_tournaments`)
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
        console.log('Upcoming Tournament:', tournaments);
        const liveTournamentContainer = document.getElementById('_tournamentUpcoming');
        tournaments.forEach(tournament => {
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
                                    <div class="_game_win_amount">Reward: N${tournament.tournamentReward}</div>
                                    <a href="" class=""><i class="fi fi-rr-info"></i> How to Win</a>
                                </div>
                                <div class="_game_player_join">
                                    <div class="_player_joined mb-2"></div>
                                    <a href="./tournament_page.html?id=${tournament._id}&tag=live" class="btn mb-1">
                                        <div class="d-flex">
                                            <div class="pointDiv">100</div>
                                            <div class="joinDiv">Join</div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
            `;

            liveTournamentContainer.appendChild(tournamentDiv);
            setupTournamentTimer(tournament._id, tournament.tournamentStartTime, tournament.tournamentEndTime);
        
        }) 
    }
    catch (error) {
        console.error('Error fetching tournament:', error); 
    }

    try {
        const response = await fetch(`${API_BASE_URL}/fetch_active_tournament?userid=${userId}`);
        const tournaments = await response.json();
        const liveTournamentContainer = document.getElementById('_tournamentActive');

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
            liveTournamentContainer.innerHTML = `
            <div class="_empty">
                <h6>You have no <b>active / joined</b> tournament</h6>
            </div>
        `;
        }

        console.log("Active tournament: ", tournaments);
        
        tournaments.forEach(tournament => {
            const tournamentDiv = document.createElement('div');
            tournamentDiv.innerHTML = `
                <div class="_active_tournament" data-start-time="${tournament.tournament.tournamentStartTime}" data-end-time="${tournament.tournament.tournamentEndTime}"  data-tournament-id="${tournament.tournament._id}">
                    <div class="_game_img">
                        <img src="${tournament.tournament.tournamentImgUrl}" alt="">
                    </div>
                    <div class="pt-2 pl-3 pr-3 pb-2">
                        <div class="_game_name">
                            <h6>${tournament.tournament.tournamentName}<span class="badge badge-success">Active!</span></h6>
                        </div>
                        <div class="_game_desc">
                            <p class="mb-2"><span id="status-${tournament.tournament._id}">Ends in: </span><b id="timer-${tournament.tournament._id}">--:--</b></p>
                            <div class="_game_win_amount">Reward: <b>N${tournament.tournament.tournamentReward}</b></div>
                            <a href="" class=""><i class="fi fi-rr-info"></i> How to Win</a>
                        </div>
                        <div class="_game_player_join">
                            <div class="_player_joined mb-2">
                                <!-- <p class="mt-2">78 players</p> -->
                            </div>
                            <a href="./tournament_page.html?id=${tournament.tournament._id}&tag=live" class="btn mb-1">
                                <div class="d-flex">
                                    <div class="pointDiv">100 pts</div>
                                     <div class="joinDiv">Open</div>
                                </div>
                            </a>
                        </div>             
                    </div>
                </div>
            `;

            liveTournamentContainer.appendChild(tournamentDiv);
            setupTournamentTimer(tournament.tournament._id, tournament.tournament.tournamentStartTime, tournament.tournament.tournamentEndTime);
        
        }) 
        
    } catch (error) {
        
    }
})

