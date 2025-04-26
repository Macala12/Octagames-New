document.addEventListener('DOMContentLoaded', async () => {

    if (document.getElementById("reward_history")) {
        try {
            const response = await fetch(`${API_BASE_URL}/get_reward_info?userid=${userid}`);
            const rewards = await response.json();
            const rewardBox = document.getElementById("_reward_history_box");
            rewardsLenght = rewards.length;
            document.querySelector(".rewardNumber").innerHTML = `${rewardsLenght} history found`;
        
            if (!response.ok) {
                const alert = document.createElement("div");
                alert.classList.add('alert');
                alert.classList.add('alertDanger');
                alert.classList.add('alert-dismissible');
                alert.classList.add('fade');
                alert.classList.add('show');
        
                alert.innerHTML = `
                   <i class="fi fi-rr-exclamation"></i> ${rewards.message}!
                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                `;
        
                mainAlert.appendChild(alert);
                console.log(rewards);
            }        
            if (rewards.length == 0) {
                rewardBox.innerHTML = `
                    <div class="_empty">
                        <h6>You have not <b>won</b> any tornament</h6>
                    </div>
                `;
            }else{
                rewards.forEach(reward => {
                    const rewardDiv = document.createElement("div");
                    rewardDiv.classList.add("_reward_history_box");
                    const detId = "hidden_details_"+reward.gameId;
                    const arrId = "arrow_"+detId;
        
                    rewardDiv.innerHTML = `
                        <span id="${arrId}">
                            <i class="fi fi-rr-angle-small-down" onclick="revealGameid('${detId}')"></i>
                        </span>
        
                        <h6>Game ID</h6>
                        <p>ID-${reward.gameId}</p>
        
                        <div class="hidden_details" id="${detId}">
                            <h6>Game Name</h6>
                            <p>${reward.gameName}</p>
        
                            <h6>Reward</h6>
                            <p>${reward.gameReward}</p>
        
                            <h6>Game Players</h6>
                            <p>${reward.gamePlayers}</p>
        
                            <h6>Date & Time</h6>
                            <p>${reward.gameDateTime}</p>
                        </div>
                    `;
        
                    rewardBox.appendChild(rewardDiv);
                });
            }
        } catch (error) {
        
        }   
    }

    if (document.getElementById("payout_history")) {
        try {
            const response = await fetch(`${API_BASE_URL}/get_payout_info?userid=${userid}`);
            const payouts = await response.json();
            const payoutBox = document.getElementById("_payout_history_box");
            payoutsLength = payouts.length;
            document.querySelector(".payoutNumber").innerHTML = `${payoutsLength} history found`;
    
            if (!response.ok) {
                const alert = document.createElement("div");
                alert.classList.add('alert');
                alert.classList.add('alertDanger');
                alert.classList.add('alert-dismissible');
                alert.classList.add('fade');
                alert.classList.add('show');
    
                alert.innerHTML = `
                   <i class="fi fi-rr-exclamation"></i> ${payouts.message}!
                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                `;
    
                mainAlert.appendChild(alert);
                console.log(payouts);
            }
            if (payouts.length == 0) {
                payoutBox.innerHTML = `
                    <div class="_empty">
                        <h6>You have not <b>redeemed</b> any reward</h6>
                    </div>
                `;
            }else{
                payouts.forEach(payout => {
                    const payoutDiv = document.createElement("div");
                    payoutDiv.classList.add("_payout_history_box");
                    const detId = "hidden_details_"+payout.reference;
                    const arrId = "arrow_"+detId;
    
                    payoutDiv.innerHTML = `
                        <span id="${arrId}">
                            <i class="fi fi-rr-angle-small-down" onclick="revealGameid('${detId}')"></i>
                        </span>
    
                        <h6>reference</h6>
                        <p>ID-${payout.reference}</p>
    
                        <div class="hidden_details" id="${detId}">
                            <h6>Status</h6>
                            <p>${payout.status}</p>
    
                            <h6>amount</h6>
                            <p>${payout.amount}</p>
    
                            <h6>Paid to</h6>
                            <p>${payout.accountName}</p>
    
                            <h6>Bank</h6>
                            <p>${payout.bankName}</p>
    
                            <h6>Account No</h6>
                            <p>${payout.accountNo}</p>
    
                            <h6>Date & Time</h6>
                            <p>${payout.updatedAt}</p>
                        </div>
                    `;
    
                    payoutBox.appendChild(payoutDiv);
                });
            }
        } catch (error) {
     
        }
    }
});