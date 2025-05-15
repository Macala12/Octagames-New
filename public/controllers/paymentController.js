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
        const response = await fetch(`http://localhost:3000/verify_paystack_payout?reference=${payment.reference}`);
        try {
            const result = await response.json();

            if (!response.ok) {
                console.log(`Error for ${payment.reference}:`, result.message || result);
            } else {
                console.log(`Success for ${payment.reference}:`, result.message);
            }
        } catch (err) {
            // console.error(`Failed to check ${payment.reference}:`, err);
            const text = await response.text();
            console.error(`Failed to parse JSON for ${reference}. Raw response:\n`, text); // 🔍 You'll see the full HTML here
            return;
        }
    }
}

// Run every 6 seconds
function startPaymentProcessor() {
    setInterval(() => {
        checkAllStatuses();
    }, 6000);
}

module.exports = { startPaymentProcessor };