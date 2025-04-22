const mongoose = require('mongoose');

const usergameinfoSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, unique: true, required: true },
    userOctacoin: Number,
    userLevel: Number,
    userXP: Number,
    userStreak: Number,
    userTopWins: Number,
    userGamesPlayed: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }, { versionKey: false });

  const UserGameInfo = mongoose.model('usergameinfo', usergameinfoSchema, 'usergameinfo');
  
  module.exports = UserGameInfo;