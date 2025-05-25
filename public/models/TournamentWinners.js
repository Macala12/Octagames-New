const mongoose = require('mongoose');

const tournamentWinnerSchema = new mongoose.Schema({
    tournamentName: String,
    tournamentId: { type: mongoose.Types.ObjectId },
    tournamentReward: Number,
    playerJoined: Number,
    firstWinner: { type: mongoose.Types.ObjectId },
    secondWinner: { type: mongoose.Types.ObjectId },
    thirdWinner: { type: mongoose.Types.ObjectId },
    tournamentStartTime: { type: Date, default: Date.now },
    tournamentEndTime: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now } 
}, {versionKey: false});

const tournamentWinner = mongoose.model('tournamentwinner', tournamentWinnerSchema, 'tournamentwinner');

module.exports = tournamentWinner;
