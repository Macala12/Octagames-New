document.querySelector("main").style.display = "none";
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const reference = urlParams.get("reference");
const verificationBox = document.getElementById("_verification_box");

document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch(`${API_BASE_URL}/verify_payment?userid=${userid}&id=${id}&reference=${reference}`);
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
        document.querySelector("main").style.display = "block";
        document.getElementById("loader").style.display = "none";
       if (result.message.status == 'success') {
            verificationBox.innerHTML = `
                <div>
                    <div class="img_box d-flex justify-content-center">
                        <img src="./Assets/_icons/checked.png" width="160px" class="img-fluid" alt="">
                    </div>
                    <h4>N${result.message.amount / 100} payment was a ${result.message.status}</h4>
                    <p>Please check your inbox and follow the instruction to verify your account.</p>
                    <a href="home.html" class="btn">Got It!</a>
                </div>
            `; 
       }else{
        verificationBox.innerHTML = `
            <div>
                <div class="img_box d-flex justify-content-center">
                    <img src="./Assets/_icons/credit-card.png" width="160px" class="img-fluid" alt="">
                </div>
                <h4>N${result.message.amount} payment ${result.message.status}</h4>
                <p>Please check your inbox and follow the instruction to verify your account.</p>
                <a href="home.html" class="btn">Got It!</a>
            </div>
        `;
       }
    }
});