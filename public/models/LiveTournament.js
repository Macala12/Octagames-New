const mongoose = require('mongoose');

const LiveTournamentSchema = new mongoose.Schema({
    tournamentName: String,
    tournamentImgUrl: String,
    tournamentDesc: String,
    tournamentReward: Number,
    entryAmount: Number,
    status: { type: String, default: 'upcoming' },
    type: {type: String, default: 'regular'},
    tagOne: { type: String, default: null },
    tagTwo: { type: String, default: null },
    tagThree: { type: String, default: null },
    playerJoinedCount: {type: Number, default: 0},
    tournamentStartTime: { type: Date, default: Date.now },
    tournamentEndTime: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {versionKey: false});

const liveTournament = mongoose.model('livetournament', LiveTournamentSchema, 'livetournament');

module.exports = liveTournament;
