document.querySelector("main").style.display = "none";
document.addEventListener('DOMContentLoaded', async () => {
    const promises = [];

    const fetchCoins = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/fetch_coins`);
            const coins = await response.json();

            if (!response.ok) {
                const alert = document.createElement("div");
                alert.classList.add('alert');
                alert.classList.add('alertDanger');
                alert.classList.add('alert-dismissible');
                alert.classList.add('fade');
                alert.classList.add('show');

                alert.innerHTML = `
                <i class="fi fi-rr-exclamation"></i> ${coins.message}!
                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                `;

                mainAlert.appendChild(alert);
                console.log(coins.message);
            }else{
                coinContainer = document.getElementById("_coins");
                coins.forEach(coin => {
                    const coinDiv = document.createElement('div');
                    const bonus = coin.bonusAmount * coin.nairaAmount;
                    const totalCoinAmount = coin.coinAmount + bonus;
                    coinDiv.innerHTML = `
                        <div class="_coin_box">
                            <div class="d-flex">
                                <div class="_coin_img">
                                    <img src="./Assets/_icons/coin.png" alt="">
                                </div>
                            </div>
                            <div class="_coin_name">
                                <h6>${coin.coinAmount} coins + ${bonus} free (N${coin.nairaAmount})</h6>
                            </div>
                            <button type="button" class="btn" data-toggle="modal" data-target="#payModal" onclick="payModal('${totalCoinAmount}', '${coin.nairaAmount}', '${coin._id}')">Buy Coin <br> <b>N${coin.nairaAmount}</b></button>
                        </div>
                    `;
                    coinContainer.appendChild(coinDiv);            
                }) 
            }
        } catch (error) {    
        }
    }

    promises.push(fetchCoins());
    await Promise.all(promises);
    setTimeout(() => {
        document.querySelector("main").style.display = "block";
        document.getElementById("loader").style.display = "none";
    }, 2000);
});

async function payModal(coinAmount, nairaAmount, coinId) {
    document.getElementById("payModal").innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">

                <!-- Modal Header -->
                <div class="modal-header">
                <h4 class="modal-title">Buy ${coinAmount} coins</h4>
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                </div>
        
                <!-- Modal body -->
                <div class="modal-body">
                    <label for="payment_gateway">Select payment option</label>
                    <p id="errorText"></p>
                    <select name="payment_gateway" class="form-control" id="payment_gateway">
                        <optgroup>
                            <option value="">--- Select an option ---</option>
                            <option value="paystack">Paystack</option>
                            <option value="rewards">Rewards</option>
                        </optgroup>
                    </select>
                </div>
        
                <!-- Modal footer -->
                <div class="modal-footer">
                <button type="button" id="btn" class="btn w-100" onclick="buyCoin('${coinId}')">Proceed to pay <b>N${nairaAmount}</b></button>
                </div>
        
            </div>
        </div>
    `;
}

async function buyCoin(coinId) {
    document.querySelector('.modal-footer button').innerHTML = `
        <span class="spinner-border spinner-border-sm"></span>
    `;
    const paymentOptions = document.getElementById("payment_gateway");
    if (paymentOptions.value.trim() == '') {
        document.getElementById("errorText").innerHTML = `<i class="fi fi-rr-exclamation mr-1"></i> You have to select an option `;
        document.getElementById("errorText").style.color = "red";
    }
    if (paymentOptions.value == 'rewards') {
        try {
            document.getElementById("btn").innerHTML = ` 
                <span class="spinner-border spinner-border-sm"></span>
                Loading..`
            ;
            const reference = generateTransactionRef("OCTASUB");
            const buyCoin = {
                coinid: coinId,
                reference: reference,
                userid: userid
            };
    
            console.log(buyCoin);
            const response = await fetch(`${API_BASE_URL}/buy_coin_rewards`,  {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(buyCoin)
            });
            const result = await response.json();
    
            if (!response.ok) {
                document.querySelector(".modal-footer").innerHTML = `
                    <button type="button" class="btn w-100">Payment Failed: <b>${result.message}</b></button>
                `;
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
                if (result.message == 'success') {
                    Swal.fire({
                        title: "Purchase Successful!",
                        text: "You're loaded now let's get back to gaming",
                        imageUrl: "./Assets/_icons/checked.png",
                        imageWidth: 150,
                        imageHeight: 150,
                        imageAlt: "Custom image",
                        background: "#1F2833",
                        color: "#fff",
                        confirmButtonText: "Got it!", // You can change the button text too
                        customClass: {
                            confirmButton: 'custom-confirm-btn'
                        },
                        buttonsStyling: false
                    });
                    document.getElementById("btn").innerHTML = `Done`;
                }
            }
    
        } catch (error) {
            
        }
    }
    if (paymentOptions.value == 'paystack') {
        try {
            const reference = generateTransactionRef("OCTASUB");
            const buyCoin = {
                coinid: coinId,
                redirect_url: `https://localhost:3000/verify_payment.html?id=${coinId}`,
                reference: reference,
                name: fullName,
                email: email
            };

            const response = await fetch(`${API_BASE_URL}/paystack_payin`,  {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(buyCoin)
            });
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
                console.log(result);
                const checkoutUrl = result.message.data.authorization_url;
                window.location.href = checkoutUrl+'';
            }

        } catch (error) {
            
        }   
    }
}

function generateTransactionRef(prefix = "TX") {
    const timestamp = Date.now(); // Current time in milliseconds
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase(); // Random alphanumeric
    return `${prefix}_${timestamp}_${randomStr}`;
}