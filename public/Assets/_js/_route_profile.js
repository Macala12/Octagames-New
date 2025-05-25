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
