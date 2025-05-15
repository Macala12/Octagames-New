const mongoose = require('mongoose');
const payoutHistories = require('../models/PayoutHistories');

async function paymentProcessor() {
    const processingPayments = await payoutHistories.find({ status: 'processing'});
    if (!processingPayments) {
        console.log('could not find payments')
    }
    if (processingPayments.length < 1) {
        console.log('no processing payment')
    }

    processingPayments.forEach(processingPayment => {
        checkStatus(processingPayment.reference);
    });
}
 
async function checkStatus(reference) {
    setInterval(async () => {
        console.log("Checking Payout");
        const response = await fetch(`https://octagames-new-production.up.railway.app/verify_paystack_payout?reference=${reference}`);
        const result = await response.json();
        if (!response.ok) {
            console.log(result.message);
        }else{
            console.log(result.message);
        }
    }, 60 * 1000);

}

module.exports = { checkStatus, paymentProcessor };
