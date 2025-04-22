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


        console.log(results);

    } catch (error) {
        
    }

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
            document.getElementById("rewardAmount").innerHTML = `
                <i class="fi fi-rr-usd-circle"></i> N${result.rewardAmount}
            `;
        }
    } catch (error) {
        
    }

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

        }

    } catch (error) {
        
    }

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
});

function bottomSheet() {
    const bottomSheet = document.getElementById("bottomSheet");
    const openBtn = document.getElementById("openSheet");
    const closeBtn = document.getElementById("closeSheet");
    const dragHandle = document.querySelector(".drag-handle");

    if (!bottomSheet || !openBtn || !closeBtn || !dragHandle) {
        console.error("One or more elements are missing from the DOM.");
        return; // Stop execution if elements are missing
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

async function deleteBank(bankId) {
    try {
        const response = await fetch(`${API_BASE_URL}/delete_bank?id=${bankId}`);
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
            accountName: accountName.value,
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
            alertBox.innerHTML = `
                <div class="alert alertSuccess alert-dismissible fade show">
                    <strong><i class="fi fi-rr-info mr-1"></i></strong> ${result.message}
                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                </div>
            `;
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
    const errorInAmount = document.getElementById("errorInAmount");

    const bankTransferData = {
        reference: generateTransactionRef("OCTASUB"),
        userid: userid,
        amount: amount,
        bankname: redeemBankName,
        bank: redeemBankCode,
        account: redeemBankAccount,
        accountname: redeemAccountName,
        name: fullName,
        email: email
    };

    if (amount < 100) {
        errorInAmount.style.color = "red";
        errorInAmount.innerHTML = `
            <i class="fi fi-rr-exclamation mr-1"></i> Amount has to be more than N100
        `;
    }else{
        if (amount > octaCoin) {
            errorInAmount.style.color = "red";
            errorInAmount.innerHTML = `
                <i class="fi fi-rr-exclamation mr-1"></i> Are you a thief? 😂, Why do you want to withdraw is more than what you have...
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
                    const bottomSheet = document.querySelector(".bottom-sheet-inner").innerHTML = `
                        <h6 class="text-center"> 
                            ${result.message}
                        </h6>
                    `;
                    console.log(result.message);
                }else{
                    console.log(result.message)
                    const bottomSheet = document.querySelector(".bottom-sheet-inner").innerHTML = `
                    <div class="drag-handle"></div>
                    <button class="btn close_sheet" id="closeSheet">Close</button>
                    <h4>Enter OTP Code</h4>
                    <p>Kindly enter the OTP code sent to your email to authorize redeem:</p>
                    <p id="errorInAmount"></p>
                    <input type="number" maxlength="5" id="otp" class="form-control">
                    <button class="btn w-100 p-3 mt-3" onclick="payOut()">Proceed to reedem</button>
                `;
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
            Must be 5 digits boss...
        `;
    }else{
        try {
            const bottomSheet = document.querySelector(".bottom-sheet-inner").innerHTML = `
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
                const bottomSheet = document.querySelector(".bottom-sheet-inner").innerHTML = `
                    <h6 class="text-center"> 
                        ${result.message}
                    </h6>
                `;
                console.log(result.message);
            }else{
                alert(result.message)
                // Payout request
                // try {
                //     const response = await fetch(`${API_BASE_URL}/reedem_payout`,  {
                //         method: 'POST',
                //         headers: {'Content-Type': 'application/json'},
                //         body: JSON.stringify(bankTransferData)
                //     });
                //     const result = await response.json();

                //     if (!response.ok) {
                //         const alert = document.createElement("div");
                //         alert.classList.add('alert');
                //         alert.classList.add('alertDanger');
                //         alert.classList.add('alert-dismissible');
                //         alert.classList.add('fade');
                //         alert.classList.add('show');

                //         alert.innerHTML = `
                //            <i class="fi fi-rr-exclamation"></i> ${result.message}!
                //             <button type="button" class="close" data-dismiss="alert">&times;</button>
                //         `;

                //         mainAlert.appendChild(alert);
                //         console.log(result.message)
                //     }
                //     console.log(result);

                // } catch (error) {
                    
                // }
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

{/* <div class="d-flex justify-content-center">
<span>
    <img src="./Assets/_icons/check.png" width="70px" alt="">
    <h4 class="text-center">Payment Successful</h4>
    <p>Your reward is on its way to you, chief</p>  
</span>
</div> */}