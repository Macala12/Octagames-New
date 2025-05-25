const mongoose = require('mongoose');

const redeemrewardSchema = new mongoose.Schema({
    userid: { type: mongoose.Schema.Types.ObjectId },
    gameId: { type: mongoose.Schema.Types.ObjectId },
    gameName: String,
    gameReward: String,
    gameImg: String,
    gameDateTime: { type: Date },
    gameType: {type: String, default:'reward'}
}, {versionKey: false});

const redeemRewardHistories = mongoose.model('reedem_reward_histories', redeemrewardSchema, 'reedem_reward_histories');

module.exports = redeemRewardHistories;