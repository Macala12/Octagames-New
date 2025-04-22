const API_BASE_URL = 'https://octagames-new-production.up.railway.app/';
const userid = sessionStorage.getItem("userid");

document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        const alertBox = document.getElementById("_alert");
        alertBox.innerHTML = `
            <div class="alert alertDanger alert-dismissible fade show">
                <strong><i class="fi fi-rr-info mr-1"></i></strong> Passwords do not match
                <!-- <button type="button" class="close" data-dismiss="alert">&times;</button> -->
            </div>
        `;
    }

    const userData = {
        userid: userid,
        password: password
    };
    
    const response = await fetch(`${API_BASE_URL}/update_password`,  {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(userData)
    });    
    
    const result = await response.json();

    if(!response.ok){
        console.log(result.message);
        const alertBox = document.getElementById("_alert");
        alertBox.innerHTML = `
            <div class="alert alertDanger alert-dismissible fade show">
                <strong><i class="fi fi-rr-info mr-1"></i></strong> ${result.message}
                <!-- <button type="button" class="close" data-dismiss="alert">&times;</button> -->
            </div>
        `;
    }else{
        console.log(result.message);
        const alertBox = document.getElementById("_alert");
        alertBox.innerHTML = `
            <div class="alert alertSuccess alert-dismissible fade show">
                <strong><i class="fi fi-rr-info mr-1"></i></strong> ${result.message}
                <!-- <button type="button" class="close" data-dismiss="alert">&times;</button> -->
            </div>
        `;
    }
    
});