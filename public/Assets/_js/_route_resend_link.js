const API_BASE_URL = 'https://octagames-new-production.up.railway.app/';
const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get("email");
const alertBox = document.getElementById("_alert");

async function resendLink() {
    const response  = await fetch(`${API_BASE_URL}/resend_link?email=${email}`);
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
        alertBox.innerHTML = `
            <div class="alert alertSuccess alert-dismissible fade show">
                <strong><i class="fi fi-rr-info mr-1"></i></strong> ${result.message}
                <!-- <button type="button" class="close" data-dismiss="alert">&times;</button> -->
            </div>
        `;
    }
}