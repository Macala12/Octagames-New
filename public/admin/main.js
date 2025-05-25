const userid = sessionStorage.getItem("userid");
const mainAlert = document.getElementById("mainAlert");

document.addEventListener('DOMContentLoaded', async () => {

   try {
    const response = await fetch(`${API_BASE_URL}/admin_user_count`) 
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
    }else{
        const progressBar = document.getElementById("progress-bar");
        let goal;

        if (result.length < 1000) {
            goal = 1000;
            document.getElementById("goal").innerHTML = goal;
            const currentPercent = result.length * 100 / goal;
            progressBar.style.width = currentPercent+"%";
        }else if (result.length >= 1000) {
            goal = 2000;
            const currentPercent = result.length * 100 / goal;
            progressBar.style.width = currentPercent+"%";
        }
        else if (result.length >= 2000) {
            goal = 3000;
            const currentPercent = result.length * 100 / goal;
            progressBar.style.width = currentPercent+"%";
        }

        document.getElementById("current_users").innerHTML = result.length;
        document.getElementById("users").innerHTML = result.length;
    }
   } catch (error) {
    
   } 

    try {
    const response = await fetch(`${API_BASE_URL}/admin_total_coin`) 
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
    }else{
        document.getElementById("total_coin").innerHTML = result.length;
    }
   } catch (error) {
    
   }

    try {
    const response = await fetch(`${API_BASE_URL}/admin_total_players`) 
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
    }else{
        document.getElementById("total_players").innerHTML = result.length;
    }
   } catch (error) {
    
   } 

   try {
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
    } catch (error) {

    }
});

if (document.getElementById('exclusive_form')) {
    document.getElementById('exclusive_form').addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const tournament_name = document.getElementById("tournament_name").value;
        const tournament_img_url = document.getElementById("tournament_img_url").value;
        const tournament_desc = document.getElementById("tournament_desc").value;
        const tournament_reward = document.getElementById("tournament_reward").value;
        const tournament_entry_amount = document.getElementById("tournament_entry_amount").value;
        const tournament_type = document.getElementById("tournament_type").value;
        const tag_one = document.getElementById("tag_one").value;
        const tag_two = document.getElementById("tag_two").value;
        const tag_three = document.getElementById("tag_three").value;
        const players_joined = document.getElementById("players_joined").value;
        const minimum_players_boolean = document.getElementById("minimum_players_boolean").value;
        const minimum_players = document.getElementById("minimum_players").value;
        const game_url = document.getElementById("game_url").value;


        if (tournament_name == "" || tournament_img_url == "" || tournament_desc == "" || tournament_reward == "" || tournament_entry_amount == "" || tournament_type == "" || game_url == "") {
            const alert = document.createElement("div");
            alert.classList.add('alert');
            alert.classList.add('alertDanger');
            alert.classList.add('alert-dismissible');
            alert.classList.add('fade');
            alert.classList.add('show');

            alert.innerHTML = `
            <i class="fi fi-rr-exclamation"></i> All details are required!
                <button type="button" class="close" data-dismiss="alert">&times;</button>
            `;

            mainAlert.appendChild(alert);
        }else{
            document.querySelector(".btn-success").innerHTML = `
                <span class="spinner-border spinner-border-sm"></span>
                Loading..
            `;
            createNewExclusiveTournament(tournament_name, tournament_img_url, tournament_desc, tournament_reward, tournament_entry_amount, tournament_type, tag_one, tag_two, tag_three, players_joined, minimum_players_boolean, minimum_players, game_url)
        }
    });
}

if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        document.querySelector(".submitBtn").innerHTML = `
        <span class="spinner-border spinner-border-sm"></span>
        `;
        
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const userData = {
            email: email,
            password: password
        };

        const response  = await fetch(`${API_BASE_URL}/login/admin`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(userData)
        });
        const result = await response.json();
        if (!response.ok) {
            const alertBox = document.getElementById("_alert");
            alertBox.innerHTML = `
                <div class="alert alertDanger alert-dismissible fade show">
                    <strong><i class="fi fi-rr-info mr-1"></i></strong> ${result.message}
                    <!-- <button type="button" class="close" data-dismiss="alert">&times;</button> -->
                </div>
            `;
            document.querySelector(".submitBtn").innerHTML = `
            Login
            `;
        }else{
            sessionStorage.setItem("userid", result.userid);
            window.location.href = "index.html?"+result.userid;
        }
    });
}

async function createNewExclusiveTournament(
  tournamentName,
  tournamentImgUrl,
  tournamentDesc,
  tournamentReward,
  entryAmount,
  type,
  tagOne,
  tagTwo,
  tagThree,
  playerJoinedCount,
  minimum_players_boolean,
  minimum_players,
  tournamentPlayUrl
) {
  const mainAlert = document.getElementById("mainAlert");
  if (!mainAlert) {
    console.error("mainAlert element not found.");
    return;
  } 

    const now = new Date();
    const lobbyDuration = 60 * 60 * 1000;
    const tournamentDuration = 60 * 60 * 1000;

    let startTime;
    let endTime;

    if (minimum_players_boolean === "true" || minimum_players_boolean === true) {
        startTime = null;
        endTime = null;
    }else{
        startTime = new Date(now.getTime() + lobbyDuration);
        endTime = new Date(startTime.getTime() + tournamentDuration);
    }

  const tournament = {
    tournamentName: `${tournamentName}`,
    tournamentImgUrl: `${tournamentImgUrl}`,
    tournamentDesc: `${tournamentDesc}`,
    tournamentReward: `${tournamentReward}`,
    entryAmount: `${entryAmount}`,
    type: `${type}`,
    tagOne: `${tagOne}`,
    tagTwo: `${tagTwo}`,
    tagThree: `${tagThree}`,
    maximumPlayers: `${playerJoinedCount}`,
    minimum_players_boolean: minimum_players_boolean,
    minimum_players: minimum_players,
    tournamentPlayUrl: `${tournamentPlayUrl}`,
    tournamentStartTime: startTime,
    tournamentEndTime: endTime,
  };

  try {
    console.log("Sending tournament creation request...");

    const response = await fetch(`${API_BASE_URL}/create_new_exclusive_tournament`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tournament),
    });

    const contentType = response.headers.get("content-type");
    let result;

    // Check if response is JSON
    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    } else {
      const text = await response.text();
      console.error("Non-JSON response:", text);
      throw new Error("Received non-JSON response from server.");
    }

    if (!response.ok) {
      console.error("API responded with error:", result);
      showAlert(mainAlert, "danger", result.message || "An error occurred");
      document.querySelector(".btn-success").innerHTML = "Add Exclusive Tournament";
    } else {
      console.log("Tournament created successfully");
        document.querySelector(".btn-success").innerHTML = `
            Add Exclusive Tournament
        `;
        const alert = document.createElement("div");
        alert.classList.add('alert');
        alert.classList.add('alertDanger');
        alert.classList.add('alert-dismissible');
        alert.classList.add('fade');
        alert.classList.add('show');

        alert.innerHTML = `
        <i class="fi fi-rr-exclamation"></i> Tournament Added Successfully!
            <button type="button" class="close" data-dismiss="alert">&times;</button>
        `;

        mainAlert.appendChild(alert);      
    }
  } catch (error) {
    console.error("Fetch error:", error);
    showAlert(mainAlert, "danger", error.message || "Something went wrong!");
    document.querySelector(".btn-success").innerHTML = "Add Exclusive Tournament";
  }
}

function showAlert(container, type, message) {
  const alert = document.createElement("div");
  alert.classList.add("alert", `alert${type === "success" ? "Success" : "Danger"}`, "alert-dismissible", "fade", "show");
  alert.innerHTML = `
    <i class="fi fi-rr-exclamation"></i> ${message}
    <button type="button" class="close" data-dismiss="alert">&times;</button>
  `;
  mainAlert.appendChild(alert);
}

function passwordReveal() {
    var x = document.querySelector(".password");
    if (x.type === "password") {
      x.type = "text";
      document.querySelector(".reveal_icon").innerHTML = `
        <i class="fi fi-rr-eye-crossed" onclick="passwordHide()"></i>
      `;
    }
}

function passwordHide() {
    var x = document.querySelector(".password");
    if (x.type === "text") {
      x.type = "password";
      document.querySelector(".reveal_icon").innerHTML = `
        <i class="fi fi-rr-eye" onclick="passwordReveal()"></i>
      `;
    }
}