const userid = sessionStorage.getItem("userid");
if (userid) {
    window.location.href = "home.html"
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const userData = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    }

    try {
        document.querySelector(".submitBtn").innerHTML = `
        <span class="spinner-border spinner-border-sm"></span>
        `;
        const response  = await fetch(`${API_BASE_URL}/login`, {
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
            document.querySelector(".submitBtn").innerHTML = `
            Login
            `;
        }
        else{
            sessionStorage.setItem("userid", result.userid);
            window.location.href = "home.html?"+result.userid;
        }
    } catch (error) {
        
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