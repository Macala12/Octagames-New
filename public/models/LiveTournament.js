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
    maximumPlayers: {type: Number, default: null},
    minimumPlayersBoolean: { type: Boolean, default: false },
    minimumPlayers: { type: Number, default: null },
    tournamentStartTime: { type: Date, default: Date.now },
    tournamentEndTime: { type: Date, default: Date.now },
    tournamentPlayUrl: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {versionKey: false});

const liveTournament = mongoose.model('livetournament', LiveTournamentSchema, 'livetournament');

module.exports = liveTournament;
