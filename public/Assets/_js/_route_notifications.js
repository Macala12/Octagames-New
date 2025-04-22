const alertBox = document.getElementById("_alert");


document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/fetch_active_tournament?userid=${userId}`);
        const tournaments = await response.json();

        if (!response.ok) {
            console.log(tournaments.message);
        }else{
            const alert = document.createElement('div')
            alert.classList.add('mb-2');
            alert.innerHTML = `
                <div class="alert alertInfo alert-dismissible fade show">
                    <i class="fi fi-rr-gift mr-1"></i>You have active game(s) to play
                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                </div>
            `;

            alertBox.appendChild(alert);
        }
    } catch (error) {
        
    }

    try {
        const response = await fetch(`${API_BASE_URL}/fetch_user_reward?userid=${userId}`);
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
            console.log(result.message)
        }else{
            if (result.rewardAmount > 0) {
                const alert = document.createElement('div')
                alert.classList.add('mb-2');
                alert.innerHTML = `
                    <div class="alert alertInfo alert-dismissible fade show">
                        <i class="fi fi-rr-gift mr-1"></i>You have reward to redeem chief!
                        <button type="button" class="close" data-dismiss="alert">&times;</button>
                    </div>
                `;

                alertBox.appendChild(alert);
            }
        }
    } catch (error) {
        
    }
})