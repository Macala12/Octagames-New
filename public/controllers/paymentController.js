const mongoose = require('mongoose');
const payoutHistories = require('../models/PayoutHistories');

async function checkAllStatuses() {
    const processingPayments = await payoutHistories.find({ status: 'processing' });

    if (!processingPayments || processingPayments.length < 1) {
        console.log('No processing payments');
        return;
    }

    console.log(`Checking ${processingPayments.length} payouts...`);
    
    for (const payment of processingPayments) {
        try {
            const response = await fetch(`https://octagames-new-production.up.railway.app/verify_paystack_payout?reference=${payment.reference}`);
            const result = await response.json();

            if (!response.ok) {
                console.log(`Error for ${payment.reference}:`, result.message || result);
            } else {
                console.log(`Success for ${payment.reference}:`, result.message);
            }
        } catch (err) {
            console.error(`Failed to check ${payment.reference}:`, err);
        }
    }
}

// Run every 6 seconds
function startPaymentProcessor() {
    setInterval(() => {
        checkAllStatuses();
    }, 30000);
}

module.exports = { startPaymentProcessor };