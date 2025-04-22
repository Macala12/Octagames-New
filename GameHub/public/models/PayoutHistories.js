const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema({
    reference: String,
    status: String,
    userid: { type: mongoose.Schema.Types.ObjectId },
    bankName: String,
    accountNo: Number,
    accountName: String,
    amount: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {versionKey: false});

const payoutHistories = mongoose.model('payouthistories', payoutSchema, 'payouthistories');

module.exports = payoutHistories;