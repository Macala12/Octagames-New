const mongoose = require("mongoose");

const transactionHistoriesSchema = new mongoose.Schema({
    reference: String,
    status: String,
    userid: { type: mongoose.Schema.Types.ObjectId },
    amount: Number,
    coinAmount: Number,
    paymentfromAccNo: Number,
    paymentfromBankName: String,
    paymentfromName: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }    
}, {versionKey: false});

const transactionHistories = mongoose.model('transactionhistories', transactionHistoriesSchema, 'transactionhistories');

module.exports = transactionHistories;