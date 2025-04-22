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
    const response = await fetch(`${API_BASE_URL}/verify_payout?reference=${reference}`);
    const result = await response.json();
    if (!reponse.ok) {
        console.log(result.message);
    }else{
        console.log(result.message);
    }
}

module.exports = { checkStatus, paymentProcessor };
