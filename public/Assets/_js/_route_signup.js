
const userid = sessionStorage.getItem("userid");
const alertBox = document.getElementById("_alert");
const usernameChecker = document.getElementById("username");
const passwordChecker = document.getElementById("password");
const errorText = document.querySelector(".error_text");
const errorTextPassword = document.querySelector(".error_text_password");
const input = document.querySelector("#phoneNumber");
const iti = window.intlTelInput(input, {
initialCountry: "ng", // Set default to Nigeria
preferredCountries: ["ng", "us", "gb"],
utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js"
});

if (userid) {
    window.location.href = "home.html"
}

function generateAvatar() {
    document.querySelector(".loaderImg").style.display = 'block';
    document.getElementById("avatar").style.display = 'none';

    const randomSeed = Math.random().toString(36).substring(2, 10);
    const avatarUrl = `https://api.dicebear.com/9.x/big-smile/svg?seed=${randomSeed}&radius=50&backgroundType=gradientLinear&randomizeIds=true&skinColor=643d19,8c5a2b,a47539,c99c62&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    document.getElementById("avatar").src = avatarUrl
    setTimeout(() => {
        document.querySelector(".loaderImg").style.display = 'none';
        document.getElementById("avatar").style.display = 'block'
    }, 5 * 1000);
}

usernameChecker.addEventListener('input', async () => {
    const username = usernameChecker.value;
    function containsEmoji(text) {
        const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
        return emojiRegex.test(text);
    }
    if (!containsEmoji(username)) {
        errorText.style.color = "red";
        errorText.style.fontSize = "12px"
        errorText.style.fontWeight = "600"
        errorText.innerHTML = 'Please include at least one emoji in your username 😄';
    }else{
        errorText.innerHTML = "OK";
        errorText.style.color = "#66fcf1";
        errorText.style.fontSize = "12px"
    }
})

passwordChecker.addEventListener('input', async () => {
    const password = passwordChecker.value;
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!regex.test(password)) {
        errorTextPassword.style.color = "red";
        errorTextPassword.style.fontSize = "10px"
        errorTextPassword.style.fontWeight = "600"
        errorTextPassword.innerHTML = 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, 1 special character, and be at least 8 characters long.';
    }else{
        errorTextPassword.innerHTML = "";
    }
})

async function checkDetails() {
    try {
        errorText.style.color = "#66fcf1";
        errorText.innerHTML = `
            <span class="spinner-border spinner-border-sm"></span> checking username...
        `;

        const response = await fetch(`${API_BASE_URL}/check_signup_info?username=${usernameChecker.value}`);
        const result = await response.json();

        if (!response.ok) {
            errorText.innerHTML = `
                Oops... username is already taken 😬
            `;
            errorText.style.color = "red";
            errorText.style.fontSize = "12px"
            errorText.style.fontWeight = "600"
        }else{
            errorText.innerHTML = '';
        }
    } catch (error) {
        
    }
}

document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmpassword").value;

    if (password !== confirmPassword) {
        const alertBox = document.getElementById("_alert");
        alertBox.innerHTML = `
            <div class="alert alertDanger alert-dismissible fade show">
                <strong><i class="fi fi-rr-info mr-1"></i></strong> Passwords do not match
                <!-- <button type="button" class="close" data-dismiss="alert">&times;</button> -->
            </div>
        `;
    } else {
        const userData = {
            userImg: document.getElementById("avatar").src,
            firstName: document.getElementById("firstname").value,
            lastName: document.getElementById("lastname").value,
            username: document.getElementById("username").value,
            email: document.getElementById("email").value,
            phoneNumber: document.getElementById("phoneNumber").value,
            password: document.getElementById("password").value,
            confirmpassword: document.getElementById("confirmpassword").value
        }; 
    
        try {
            document.querySelector(".submitBtn").innerHTML = `
                 <span class="spinner-border spinner-border-sm"></span>
            `;
            const response = await fetch(`${API_BASE_URL}/signup`,  {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(userData)
            });
    
            const result = await response.json();
            console.log("Server Response:", result);

            if (!response.ok) {
                alertBox.innerHTML = `
                    <div class="alert alertDanger alert-dismissible fade show">
                        <strong><i class="fi fi-rr-info mr-1"></i></strong> ${result.message}
                        <!-- <button type="button" class="close" data-dismiss="alert">&times;</button> -->
                    </div>
                `;
                document.querySelector(".submitBtn").innerHTML = `
                    Sign Up
                `;
            }else{
                window.location.href = "verification_link.html?email="+email;
            }
    
        } catch (error) {
            
        }   
    }
});

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