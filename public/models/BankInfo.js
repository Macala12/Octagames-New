const mongoose = require('mongoose');

const bankInfoSchema = new mongoose.Schema({
    userid: { type: mongoose.Types.ObjectId },
    bankName: String,
    bankCode: Number,
    bankImg: String,
    accountNo: Number,
    accountName: String,
    recipientCode: String
}, {versionKey: false});

const bankInfo = mongoose.model('bankinfo', bankInfoSchema, 'bankinfo');

module.exports = bankInfo;