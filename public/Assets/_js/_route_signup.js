const API_BASE_URL = 'https://octagames-new-production.up.railway.app';

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

document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmpassword").value;
    // const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // if (!regex.test(password)) {
    //     alert("Password must contain at least 1 uppercase, 1 lowercase, 1 number, 1 special character, and be at least 8 characters long.");
    //     e.preventDefault(); // Prevent form submission
    // }

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
            const response = await fetch(`${API_BASE_URL}/signup`,  {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(userData)
            });
    
            const result = await response.json();
            console.log("Server Response:", result);

            if (!response.ok) {
                const alertBox = document.getElementById("_alert");
                alertBox.innerHTML = `
                    <div class="alert alertDanger alert-dismissible fade show">
                        <strong><i class="fi fi-rr-info mr-1"></i></strong> ${result.message}
                        <!-- <button type="button" class="close" data-dismiss="alert">&times;</button> -->
                    </div>
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