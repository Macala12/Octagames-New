document.querySelector("main").style.display = "none";
const alertBox = document.getElementById("_alert");
const bank_box = document.getElementById("_redeem_box");
const payout_history_box = document.getElementById("_payout_history_box");

const selectField = document.getElementById("payment_gateway");
const inputField = document.getElementById("account_no");
const accountName = document.querySelector(".account_name");
const statusMessage = document.getElementById("statusMessage");

//Changing Variables
var redeemBankCode;
var redeemBankAccount;
var redeemAccountName;
var redeemBankName;
var rewardsLenght;
var payoutsLength;
let amountVar;
let walletBal;

inputField.addEventListener("input", async () => {
  const value = inputField.value;
  accountName.innerHTML = `            
        <span class="spinner-border spinner-border-sm"></span>
        Fetching..
    `;

  if (value.length === 10) {
    statusMessage.textContent = "Ok!";
    statusMessage.style.color = "#66FCF1";

    const bankData = {
        bank: selectField.value,
        account: inputField.value
    };

    try {
        console.log("Working: in action");
        console.log(bankData);
        const response = await fetch(`${API_BASE_URL}/fetch_bank_account`,  {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(bankData)
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
               <i class="fi fi-rr-exclamation"></i> ${result.error}!
                <button type="button" class="close" data-dismiss="alert">&times;</button>
            `;
            mainAlert.appendChild(alert);
            accountName.innerHTML = `            
                <i class="fi fi-rr-exclamation mr-1"></i> ${result.error}
            `;
            console.log(result)
        }

        const apiAccountName = result.data.account_name;
        console.log(apiAccountName);
        accountName.innerHTML = apiAccountName;
    } catch (error) {
        
    }
  } else {
    // statusMessage.textContent = `${value.length}/10 digits`;
    statusMessage.textContent = `Account number must be 10 digits`;
    statusMessage.style.color = "red";
  }
});

document.addEventListener('DOMContentLoaded', async () => {
    const promises = [];
    const fetchBank = async () => {     
        try {
            const response = await fetch(`${API_BASE_URL}/fetch_bank`);
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
            }

            const bankData = result.data;
            bankData.forEach(bankDatum => {
                const paymentOptions = document.createElement("option");
                paymentOptions.id = "optionBankName";
                paymentOptions.value = bankDatum.code;
                paymentOptions.innerHTML = bankDatum.name;

                selectField.appendChild(paymentOptions);
            });


            console.log(result);

        } catch (error) {
            
        }
    }

    const fetchUserReward = async () => {  
        try {
            const response = await fetch(`${API_BASE_URL}/fetch_user_reward?userid=${userid}`);
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
                walletBal = result.rewardAmount;
                document.getElementById("rewardAmount").innerHTML = `
                    N${result.rewardAmount}
                `;
            }
        } catch (error) {
            
        }
    }

    const getBankInfo = async () => {  
        try {
            const response = await fetch(`${API_BASE_URL}/get_bank_info?userid=${userid}`);
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
                const bank_box = document.getElementById("_redeem_box");
                const optionBottomSheet = document.getElementById("optionBox");

                if (result.length == 0) {
                    bank_box.innerHTML = `
                        <div class="_empty">
                            <h6>
                                <span>Add a <b>bank account</b> to redeem reward</span>
                            </h6>
                        </div>
                    `;
                }

                result.forEach(bank => {
                    const bankAccountBox = document.createElement('div');
                    bankAccountBox.classList.add('_bank_acoount_box');
                    bankAccountBox.classList.add('d-flex');
                    bankAccountBox.innerHTML = `
                        <div class="_bank_details w-100">
                            <h6>Bank Name:</h6>
                            <p>${bank.bankName}</p>
                            <h6>Account No:</h6>
                            <p>${bank.accountNo}</p>
                            <h6>Account Name:</h6>
                            <p>${bank.accountName}</p>
                        </div>
                        <div class="_bank_img w-100 d-flex justify-content-center">
                            <img src="${bank.bankImg}" width="80px" alt="">
                        </div>
                        <button class="_delete btn" onclick="deleteBank('${bank._id}')"><i class="fi fi-rr-trash"></i></button>
                    `;

                    const optionBox = document.createElement('div');
                    optionBox.classList.add('d-flex');
                    optionBox.classList.add('opBox');
                    optionBox.innerHTML = `
                        <input type="radio" name="bank" id="bank" value="${bank.bankCode}" onclick="fetchBank('${bank.bankCode}')">
                        <div class="optionBox d-flex ml-3">
                            <img src="${bank.bankImg}" class="img-fluid" alt="" width="50px">
                            <h6 class="ml-2 pt-2">${bank.accountNo}</h6>
                        </div>
                    `;

                    optionBottomSheet.appendChild(optionBox);
                    bank_box.appendChild(bankAccountBox);
                });

                const dot = document.querySelector(".bank_number_dot");
                if (result.length === 1) {
                    dot.innerHTML = `
                        <span class="fill"></span>
                        <span class="outline"></span>
                        <span class="outline"></span>
                    `
                }else if (result.length === 2){
                    dot.innerHTML = `
                        <span class="fill"></span>
                        <span class="fill"></span>
                        <span class="outline"></span>
                    `
                }else if (result.length === 3){
                    dot.innerHTML = `
                        <span class="fill"></span>
                        <span class="fill"></span>
                        <span class="fill"></span>
                    `
                }
            }

        } catch (error) {
            
        }
    }

    const getRewardInfo = async () => {   
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
                rewards.slice(0, 3).forEach(reward => {
                    const rewardDiv = document.createElement("div");
                    rewardDiv.classList.add("_reward_history_box");
                    const detId = "hidden_details_"+reward.gameId;
                    const arrId = "arrow_"+detId;

                    const isoDate = reward.gameDateTime;
                    const date = new Date(isoDate);
                    const readableDate = date.toLocaleString();

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
                            <p>${readableDate}</p>
                        </div>
                    `;

                    rewardBox.appendChild(rewardDiv);
                });
            }
        } catch (error) {
    
        }
    }

    const getPayoutInfo = async () => {    
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
                payouts.slice(0, 3).forEach(payout => {
                    const payoutDiv = document.createElement("div");
                    payoutDiv.classList.add("_payout_history_box");
                    const detId = "hidden_details_"+payout.reference;
                    const arrId = "arrow_"+detId;

                    const isoDate = payout.updatedAt;
                    const date = new Date(isoDate);
                    const readableDate = date.toLocaleString();
                    let badge;
                    if (payout.status === "processing") {
                        badge = `
                            <div class="badge processing_badge">
                                Processing
                            </div>
                        `;
                    }else if(payout.status === "success"){
                        badge = `
                            <div class="badge paid_badge">
                                Paid
                            </div>
                        `;
                    }

                    payoutDiv.innerHTML = `
                        <span id="${arrId}">
                            <i class="fi fi-rr-angle-small-down" onclick="revealGameid('${detId}')"></i>
                        </span>

                        <h6>
                            Transaction Ref
                            ${badge}
                        </h6>
                        <p>${payout.reference}</p>

                        <div class="hidden_details" id="${detId}">
                            <h6>Status</h6>
                            <p>${payout.status}</p>

                            <h6>Amount</h6>
                            <p>${payout.amount}</p>

                            <h6>Paid to</h6>
                            <p>${payout.accountName}</p>

                            <h6>Bank</h6>
                            <p>${payout.bankName}</p>

                            <h6>Account No</h6>
                            <p>${payout.accountNo}</p>

                            <h6>Date & Time</h6>
                            <p>${readableDate}</p>
                        </div>
                    `;

                    payoutBox.appendChild(payoutDiv);
                });
            }
        } catch (error) {
    
        }
    }

    function bottomSheet() {
        const bottomSheet = document.getElementById("bottomSheet");
        const openBtn = document.getElementById("openSheet");
        const closeBtn = document.getElementById("closeSheet");
        const dragHandle = document.querySelector(".drag-handle");
    
        if (!bottomSheet || !openBtn || !closeBtn || !dragHandle) {
            console.error("One or more elements are missing from the DOM.");
            return;
        }
    
        let isDragging = false, startY, startBottom;
    
        // Open the bottom sheet
        openBtn.addEventListener("click", () => {
            bottomSheet.style.bottom = "0"; // Slide up
        });
    
        // Close the bottom sheet
        function closeSheet() {
            bottomSheet.style.bottom = "-100%"; // Slide down
        }
    
        // Close when clicking outside the bottom sheet
        // document.addEventListener("click", (event) => {
        //     if (!bottomSheet.contains(event.target) && event.target !== openBtn) {
        //         closeSheet();
        //     }
        // });
    
        // Close when clicking the close button
        closeBtn.addEventListener("click", closeSheet);
    
        // Start dragging
        dragHandle.addEventListener("touchstart", (e) => {
            isDragging = true;
            startY = e.touches[0].clientY;
            startBottom = parseInt(getComputedStyle(bottomSheet).bottom);
        });
    
        // While dragging
        document.addEventListener("touchmove", (e) => {
            if (!isDragging) return;
            let moveY = startY - e.touches[0].clientY;
            let newBottom = startBottom + moveY;
            bottomSheet.style.bottom = Math.max(-100, Math.min(newBottom, 0)) + "%";
        });
    
        // Stop dragging
        document.addEventListener("touchend", () => {
            isDragging = false;
        });
    }
    bottomSheet();

    promises.push(fetchBank(), fetchUserReward(), getBankInfo(), getRewardInfo(), getPayoutInfo());
    await Promise.all(promises);
    setTimeout(() => {
        document.querySelector("main").style.display = "block";
        document.getElementById("loader").style.display = "none";
    }, 2000);
});

async function deleteBank(bankId) {
    try {
        document.querySelector('._delete').innerHTML = `
            <span class="spinner-border spinner-border-sm"></span>
        `;
        const response = await fetch(`${API_BASE_URL}/delete_bank?id=${bankId}`);
        const result = await response.json();

        if (!response.ok) {
            document.querySelector('._delete').innerHTML = `
                <i class="fi fi-rr-trash"></i>
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
            window.location.reload();
        }

    } catch (error) {
        
    }
}

async function addBank() {
    try {
        document.querySelector(".modal-footer .btn").innerHTML = ` 
            <span class="spinner-border spinner-border-sm"></span>
            Loading..`
        ;

        bankData = {
            userid: userid,
            bankName: document.querySelector(`#payment_gateway option[value="${selectField.value}"]`).innerHTML,
            bankCode: selectField.value,
            accountNo: inputField.value,
            accountName: accountName.innerHTML,
        };


        const response = await fetch(`${API_BASE_URL}/add_bank_info`,  {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(bankData)
        });
        const result = await response.json();

        if (!response.ok) {
            document.querySelector(".modal-footer").innerHTML = `
                <button type="button" class="btn w-100">Failed: <b>${result.message}</b></button>
            `;
            console.log(result.message);
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
        }else{
            document.querySelector(".modal-footer .btn").innerHTML = ` 
                Add Bank Account`
            ;
            Swal.fire({
                title: "Successful!",
                text: "You're bank account has been added successfully, you can now redeem your rewards",
                imageUrl: "./Assets/_icons/checked.png",
                imageWidth: 150,
                imageHeight: 150,
                imageAlt: "Custom image",
                background: "#1F2833",
                color: "#fff",
                confirmButtonText: "Nice!", // You can change the button text too
                customClass: {
                    confirmButton: 'custom-confirm-btn'
                },
                buttonsStyling: false
            });
        }
    } catch (error) {
        
    }
}

function revealGameid(gameid) {
    const arrId = "arrow_"+gameid
    document.getElementById(gameid).style.display = "block";
    document.getElementById(gameid).style.transition = "1s";
    document.getElementById(arrId).innerHTML = `
        <i class="fi fi-rr-angle-small-up" onclick="hideGameid('${gameid}')"></i>
    `;
}

function hideGameid(gameid) {
    const arrId = "arrow_"+gameid;
    document.getElementById(gameid).style.display = "none";
    document.getElementById(gameid).style.transition = "1s";
    document.getElementById(arrId).innerHTML = `
        <i class="fi fi-rr-angle-small-down" onclick="revealGameid('${gameid}')"></i>
    `;
}

async function addpayout() {
    try {
        const response = await fetch(`${API_BASE_URL}/addpayout`,  {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
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
            console.log(result.message);
        }
    } catch (error) {
        
    }
}

async function fetchBank(bankCode) {
    document.querySelector(".bank_details").style.display = "block";
    document.querySelector(".bank_details").innerHTML = `
        <h6 class="text-center"> 
            <span class="spinner-border spinner-border-sm mr-1"></span>
            Loading..
        </h6>
    `;

    try {
        const response = await fetch(`${API_BASE_URL}/redeem_get_bank_info?userid=${userid}&bankCode=${bankCode}`);
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
            redeemBankAccount = result.accountNo;
            redeemBankCode = result.bankCode;
            redeemBankName = result.bankName;
            redeemAccountName = result.accountName;
            document.querySelector(".bank_details").innerHTML = `
                <h6>Bank Name</h6>
                <p>${result.bankName}</p>
                <h6>Account Number</h6>
                <p>${result.accountNo}</p>
                <h6>Account Name</h6>
                <p>${result.accountName}</p>
            `;
            document.getElementById("redeemBtn").innerHTML = `
                <label for="amount">Amount to reedem:</label>
                <p id="errorInAmount"></p>
                <input type="number" id="amount" placeholder="N5000" class="form-control">
                <button class="btn w-100 p-3 mt-3" onclick="reedempayout()">Redeem</button>
            `;
        }
    } catch (error) {
        
    }
}

async function reedempayout() {
    const amount = document.getElementById("amount").value;
    amountVar = amount;
    const errorInAmount = document.getElementById("errorInAmount");

    if (amount < 100) {
        errorInAmount.style.color = "red";
        errorInAmount.innerHTML = `
            <i class="fi fi-rr-exclamation mr-1"></i> Amount has to be more than N100
        `;
    }else{
        if (amount > walletBal) {
            errorInAmount.style.color = "red";
            errorInAmount.innerHTML = `
                <i class="fi fi-rr-exclamation mr-1"></i> Are you a thief? 😂, Why do you want to withdraw more than what you have hmm senior man...
            `;
        }else{
            try {
                const bottomSheet = document.querySelector(".bottom-sheet-inner").innerHTML = `
                    <h6 class="text-center"> 
                        <span class="spinner-border spinner-border-sm mr-1"></span>
                        Loading..
                    </h6>
                `;
                const userData = {
                    userid: userid
                };

                const response = await fetch(`${API_BASE_URL}/otp`,  {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(userData)
                });
                const result = await response.json();

                if (!response.ok) {
                    document.querySelector(".bottom-sheet-inner").innerHTML = `
                        <h6 class="text-center"> 
                            ${result.message}
                        </h6>
                    `;
                    console.log(result.message);
                }else{
                    console.log(result.message)
                    document.querySelector(".bottom-sheet-inner").innerHTML = `
                        <div class="drag-handle"></div>
                        <button class="btn close_sheet" id="closeSheet">Close</button>
                        <h4>Enter OTP Code</h4>
                        <p>Kindly enter the OTP code sent to your email to authorize redeem:</p>
                        <p id="errorInAmount"></p>
                        <input type="number" maxlength="5" id="otp" class="form-control">
                        <button class="btn w-100 p-3 mt-3" id="otpButton" onclick="payOut()">Proceed to reedem</button>
                    `;
                    const closeBtn = document.getElementById("closeSheet");
                    closeBtn.addEventListener("click", closeSheet);

                }

            } catch (error) {
                
            }
        }
    }
}

async function payOut() {
    const otp = document.getElementById("otp").value;
    if (otp.length < 6 || otp.length > 6) {
        document.getElementById("errorInAmount").innerHTML = `
            <i class="fi fi-rr-info mr-1 pt-1">
            OTP code must be 5 digits boss...
        `;
        document.getElementById("errorInAmount").style.color = '#dc3545';
    }else{
        try {
            const bottomSheet = document.querySelector(".bottom-sheet-inner");
            bottomSheet.innerHTML = `
                <div class="drag-handle"></div>
                <button class="btn close_sheet" id="closeSheet">Close</button>
                <div class="d-flex justify-content-center">
                    <h6 class="text-center"> 
                        <span class="spinner-border spinner-border-sm mr-1" style="font-size: 20px; width: 2rem; height: 2rem;"></span>
                    </h6>
                </div>
            `;
        
            const response = await fetch(`${API_BASE_URL}/verify_otp?userid=${userid}&otp=${otp}`);
            const result = await response.json();
        
            if (!response.ok) {
                bottomSheet.innerHTML = `
                    <h6 class="text-center">${result.message}</h6>
                `;
                console.log("OTP verification failed:", result.message);
            } else {
                console.log("OTP verified:", result.message);
        
                const bankTransferData = {
                    userid: userid,
                    amount: amountVar,
                    bankName: redeemBankName,
                    accountNo: redeemBankAccount,
                    accountName: redeemAccountName
                };
        
                try {
                    console.log('Starting Payout...');
                    const payoutRes = await fetch(`${API_BASE_URL}/paystack_payout`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(bankTransferData)
                    });
        
                    const payoutResult = await payoutRes.json();
        
                    if (!payoutRes.ok) {
                        const alert = document.createElement("div");
                        alert.classList.add('alert', 'alertDanger', 'alert-dismissible', 'fade', 'show');
                        alert.innerHTML = `
                            <i class="fi fi-rr-exclamation"></i> ${payoutResult.message}!
                            <button type="button" class="close" data-dismiss="alert">&times;</button>
                        `;
                        mainAlert.appendChild(alert);
                        console.log("Payout failed:", payoutResult.message);
                    } else {
                        bottomSheet.innerHTML = `
                            <img src="./Assets/_icons/withdraw.png" class="d-block mx-auto mb-2" width="70px" alt="">
                            <h6 class="text-center" style="font-weight: 700;">Your withdrawal is on its way, Chief</h6>
                            <button class="btn w-100 p-3 mt-3" id="closeSheet">Okay!</button>

                        `;
                        const closeBtn = document.getElementById("closeSheet");
                        closeBtn.addEventListener("click", closeSheet);

                        console.log("Payout successful:", payoutResult.message);
                    }
                } catch (error) {
                    console.error('Error with Paystack payout:', error);
                }
            }
        } catch (error) {
            console.error("Error verifying OTP or handling payout:", error);
        }
        
    }

}

function closeSheet() {
    bottomSheet.style.bottom = "-100%"; // Slide down
}

function generateTransactionRef(prefix = "TX") {
    const timestamp = Date.now(); // Current time in milliseconds
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase(); // Random alphanumeric
    return `${prefix}_${timestamp}_${randomStr}`;
}
