const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 900 }
}, {versionKey: false});

const Otp = mongoose.model('otp', otpSchema, 'otp');

module.exports = Otp;