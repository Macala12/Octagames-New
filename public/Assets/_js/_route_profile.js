document.querySelector("._confirm_btn").style.display = "none";

async function sendEmail() {
    try {
        const response = await fetch(`${API_BASE_URL}/send_email?userid=${userid}`);
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
        }else{
            window.location.href= "password_reset_link.html";
        }
    
    } catch (error) {
        
    }
}

async function logOut() {
    sessionStorage.clear();
    window.location.href = "login.html";
}

let avatarurl;
function generateAvatar() {
    document.querySelector("._change_btn").innerHTML = `
        <span class="spinner-border spinner-border-sm"></span>
    `;
    document.querySelector(".loaderImg").style.display = 'block';
    document.querySelector(".circular-image").style.display = 'none';

    const randomSeed = Math.random().toString(36).substring(2, 10);
    const avatarUrl = `https://api.dicebear.com/9.x/big-smile/svg?seed=${randomSeed}&radius=50&backgroundType=gradientLinear&randomizeIds=true&skinColor=643d19,8c5a2b,a47539,c99c62&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    document.querySelector(".circular-image").style.background = `url('${avatarUrl}')`;
    avatarurl = avatarUrl;
    setTimeout(() => {
        document.querySelector(".loaderImg").style.display = 'none';
        document.querySelector(".circular-image").style.display = 'block';
        document.querySelector("._confirm_btn").style.display = "block";
        document.querySelector("._change_btn").innerHTML = `
            Change avatar
        `;
    }, 5 * 1000);
}

async function saveAvatar() {
    try {
        document.querySelector("._confirm_btn").innerHTML = `
            <span class="spinner-border spinner-border-sm"></span>
        `;
        console.log(avatarurl);

        const userData = {
            avatarurl: avatarurl,
            userid: userid
        };
        
        const response = await fetch(`${API_BASE_URL}/change_avatar`,  {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(userData)
        });
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
            document.querySelector("._change_btn").innerHTML = `
                Change avatar
            `;
            document.querySelector("._confirm_btn").style.display = "none";
            console.log(result.message);
        }else{
            document.querySelector("._confirm_btn").style.display = "none";

            const alert = document.createElement("div");
            alert.classList.add('alert');
            alert.classList.add('alertSuccess');
            alert.classList.add('alert-dismissible');
            alert.classList.add('fade');
            alert.classList.add('show');

            alert.innerHTML = `
                <i class="fi fi-rr-exclamation"></i> Avatar changed successfully! 
                <button type="button" class="close" data-dismiss="alert">&times;</button>
            `;

            mainAlert.appendChild(alert);
        }
    } catch (error) {
        
    }
}
