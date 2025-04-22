const mongoose = require('mongoose');

const coinsSchema = new mongoose.Schema({
    coinAmount: Number,
    nairaAmount: Number,
    bonus: { type: Boolean, default: true },
    bonusAmount: Number
}, {versionKey: false});

const coins = mongoose.model('coins', coinsSchema, 'coins');

module.exports = coins;