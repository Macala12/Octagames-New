const alertBox = document.getElementById("_alert");


document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/check_skip_tutorials?userid=${userid}`);
        const result = await response.json();

        if (!response.ok) {
        }else{
            const mainAlert = document.querySelector("._notification");
            const alert = document.createElement('div')
            alert.classList.add('mb-2');
            alert.innerHTML = `
                <div class="alert alertWarning fade show" onclick="showTutorialModal()">
                    &#x1F3A5 You haven't completed your tutorial video yet. <i class="fi fi-rr-angle-small-right float-right"></i>
                </div>
            `;

            mainAlert.appendChild(alert);
        }
    } catch (error) {
        
    }
})