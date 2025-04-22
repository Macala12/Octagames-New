const mongoose = require('mongoose');

const rewardInfoSchema = new mongoose.Schema({
   rewardAmount: Number,
   hasWon: { type: Boolean, default: false },
   lastReward: Number
}, {versionKey: false});

const rewardInfo = mongoose.model('reward', rewardInfoSchema, 'reward');

module.exports = rewardInfo;