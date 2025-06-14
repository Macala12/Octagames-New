const mongoose = require('mongoose');
const Tournament = require('../models/LiveTournament');
const Leaderboard = require('../models/Leaderboard');
const rewardInfo = require('../models/RewardInfo');
const redeemRewardHistories = require('../models/RedeemRewardHistories');
const UserGameInfo = require('../models/UserGameInfo');
const liveTournament = require('../models/LiveTournament');
const tournamentwinner = require('../models/TournamentWinners');


// Function to create a new tournament
async function createNewTournament(tournamentName, tournamentImgUrl, tournamentDesc, tournamentReward, entryAmount, tournamentPlayUrl) {
    const now = new Date();
    const lobbyDuration = 10 * 60 * 1000;  // Lobby duration (e.g., 5 minutes)
    const tournamentDuration = 10 * 60 * 1000; // Tournament duration (e.g., 10 minutes)

    // Set start and end times
    const startTime = new Date(now.getTime() + lobbyDuration); // Start after 5 minutes from now
    const endTime = new Date(startTime.getTime() + tournamentDuration); // End after 10 minutes of active time

    // Create new tournament document in MongoDB
    const tournament = await Tournament.create({
        tournamentName,
        tournamentImgUrl,
        tournamentDesc,
        tournamentReward,
        entryAmount,
        tournamentStartTime: startTime,
        tournamentEndTime: endTime,
        tournamentPlayUrl
    });

    console.log(`New tournament created with ID: ${tournament._id}`);
    return tournament;
}

async function createNewExclusiveTournament(tournamentName, tournamentImgUrl, tournamentDesc, tournamentReward, entryAmount, type, tagOne, tagTwo, tagThree, playerJoinedCount, tournamentPlayUrl) {
    const now = new Date();
    const lobbyDuration = 7.5 * 60 * 1000;  // Lobby duration (e.g., 1 hour, 15 minutes)
    const tournamentDuration = 7.5 * 60 * 1000; // Tournament duration (e.g., 15 minutes)

    // Set start and end times
    const startTime = new Date(now.getTime() + lobbyDuration); // Start after 15 minutes from now
    const endTime = new Date(startTime.getTime() + tournamentDuration); // End after 15 minutes of active time

    // Create new tournament document in MongoDB
    const tournament = await Tournament.create({
        tournamentName,
        tournamentImgUrl,
        tournamentDesc,
        tournamentReward,
        entryAmount,
        type,
        tagOne,
        tagTwo,
        tagThree,
        playerJoinedCount,
        tournamentPlayUrl,
        tournamentStartTime: startTime,
        tournamentEndTime: endTime
    });

    console.log(`New Exclusive tournament created with ID: ${tournament._id}`);
    return tournament;
}

// Tournament lifecycle checker (polls every 10s)
function handleTournamentLifecycle(tournamentId) {
    const interval = setInterval(async () => {
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            console.log(`Tournament ${tournamentId} not found.`);
            clearInterval(interval);
            return;
        }

        const now = new Date();

        if (tournament.minimumPlayersBoolean === true || tournament.minimumPlayersBoolean === "true") {
            if (tournament.minimumPlayers > tournament.playerJoinedCount) {
                const now = new Date();
                const lobbyDuration = 60 * 60 * 1000;  // Lobby duration (e.g., 1 hour)
                const tournamentDuration = 60 * 60 * 1000; // Tournament duration (e.g., 1 hour)

                // Set start and end times
                const startTime = new Date(now.getTime() + lobbyDuration); // Start after 1 hour minutes from now
                const endTime = new Date(startTime.getTime() + tournamentDuration); // End after 1 hour of active time

                await Tournament.findByIdAndUpdate(tournamentId, { tournamentStartTime: startTime, tournamentEndTime: endTime });
            }
        }

        if (tournament.status === 'upcoming' && now >= tournament.tournamentStartTime && now < tournament.tournamentEndTime) {
            await Tournament.findByIdAndUpdate(tournamentId, { status: 'active' });
            console.log(`Tournament ${tournamentId} is now active.`);
        }

        if (tournament.status === 'active' && now >= tournament.tournamentEndTime) {
            const tournamentWinner = await Leaderboard.find({ leaderboardId: tournamentId }).sort({ score: -1 }).limit(3).exec();
            if (tournamentWinner.length == 0) {
                // console.log(`No Player in this tournament`);
            }else{
                const topThreeIds = tournamentWinner.map(doc => doc.userId);
                const endStreak = await UserGameInfo.updateMany(
                    { userid: { $nin: topThreeIds } },  // not in the first 3
                    { $set: { userStreak: 0 } }
                );
                if (!endStreak) { 
                    console.error(error);
                }else{
                    console.log("Ended streaks of losers")
                }

                //First Winner
                if (tournamentWinner[0]) {
                    const winnerUsername = tournamentWinner[0].username;
                    const winnerUserId = tournamentWinner[0].userId;
                    console.log(tournamentWinner);
                    console.log(`Winner is ${winnerUsername} with Userid of: ${winnerUserId}`);
        
                    const objectId = new mongoose.Types.ObjectId(winnerUserId);

                    //Update user wins
                    const updateWins = await UserGameInfo.findOneAndUpdate({ userId: objectId }, { $inc: { userTopWins: 1, userStreak: 1 } });
                    if(!updateWins){
                        console.log('Could not update user wins')
                    }

                    const getUserRewardAmount = await rewardInfo.findById(objectId);
                    if (!getUserRewardAmount) {
                        console.log('Could not find reward user');
                    }
                    const userReward = getUserRewardAmount.rewardAmount;
                    const newReward = userReward + tournament.tournamentReward * 0.4;
        
                    const updateReward = await rewardInfo.findByIdAndUpdate(objectId, { rewardAmount: newReward, hasWon: true, lastReward: tournament.tournamentReward * 0.4 });
                    if (!updateReward) {
                        console.log('Could not update reward user');
                    }
        
                    const saveRewardHistory = new redeemRewardHistories({
                        userid: objectId,
                        gameId: tournament._id,
                        gameName: tournament.tournamentName,
                        gameReward: tournament.tournamentReward * 0.4,
                        gameImg: tournament.tournamentImgUrl,
                        gameDateTime: tournament.tournamentEndTime
                    });
                    await saveRewardHistory.save(); 
                }else{
                    console.log("No first Player")
                }

                //Second Winner
                if (tournamentWinner[1]) {
                    const winnerUsername2 = tournamentWinner[1].username;
                    const winnerUserId2 = tournamentWinner[1].userId;
                    console.log(`Second Winner is ${winnerUsername2} with Userid of: ${winnerUserId2}`);
        
                    const objectId2 = new mongoose.Types.ObjectId(winnerUserId2);

                    //Update user wins
                    const updateWins2 = await UserGameInfo.findOneAndUpdate({ userId: objectId2 }, { $inc: { userTopWins: 1, userStreak: 1 } });
                    if(!updateWins2){
                        console.log('Could not update user wins')
                    }

                    const getUserRewardAmount2 = await rewardInfo.findById(objectId2);
                    if (!getUserRewardAmount2) {
                        console.log('Could not find reward user');
                    }
                    const userReward2 = getUserRewardAmount2.rewardAmount;
                    const newReward2 = userReward2 + tournament.tournamentReward * 0.2;
        
                    const updateReward2 = await rewardInfo.findByIdAndUpdate(objectId2, { rewardAmount: newReward2, hasWon: true, lastReward: tournament.tournamentReward * 0.2 });
                    if (!updateReward2) {
                        console.log('Could not find reward user');
                    }
        
                    const saveRewardHistory2 = new redeemRewardHistories({
                        userid: objectId2,
                        gameId: tournament._id,
                        gameName: tournament.tournamentName,
                        gameReward: tournament.tournamentReward * 0.2,
                        gameImg: tournament.tournamentImgUrl,
                        gameDateTime: tournament.tournamentEndTime
                    });
                    await saveRewardHistory2.save();

                }else{
                    console.log("No second player")
                }
 
                //Third Winner
                if (tournamentWinner[2]) {
                    const winnerUsername3 = tournamentWinner[2].username;
                    const winnerUserId3 = tournamentWinner[2].userId;
                    console.log(`Third Winner is ${winnerUsername3} with Userid of: ${winnerUserId3}`);
        
                    const objectId3 = new mongoose.Types.ObjectId(winnerUserId3);

                    //Update user wins
                    const updateWins3 = await UserGameInfo.findOneAndUpdate({ userId: objectId3 }, { $inc: { userTopWins: 1, userStreak: 1 } });
                    if(!updateWins3){
                        console.log('Could not update user wins')
                    }
                    
                    const getUserRewardAmount3 = await rewardInfo.findById(objectId3);
                    if (!getUserRewardAmount3) {
                        console.log('Could not find reward user');
                    }
                    const userReward3 = getUserRewardAmount3.rewardAmount;
                    const newReward3 = userReward3 + tournament.tournamentReward * 0.1;
        
                    const updateReward3 = await rewardInfo.findByIdAndUpdate(objectId3, { rewardAmount: newReward3, hasWon: true, lastReward: tournament.tournamentReward * 0.1  });
                    if (!updateReward3) {
                        console.log('Could not find reward user');
                    }
        
                    const saveRewardHistory3 = new redeemRewardHistories({
                        userid: objectId3,
                        gameId: tournament._id,
                        gameName: tournament.tournamentName,
                        gameReward: tournament.tournamentReward * 0.1,
                        gameImg: tournament.tournamentImgUrl,
                        gameDateTime: tournament.tournamentEndTime
                    });
                    await saveRewardHistory3.save();
                }else{
                    console.log("No third player")
                }

                const saveTournamentWinner = await tournamentwinner.create({
                    tournamentName: tournament.tournamentName,
                    tournamentId: tournament._id,
                    tournamentReward: tournament.tournamentReward,
                    playerJoined: tournament.playerJoinedCount,
                    firstWinner: tournamentWinner[0]?.userId ? new mongoose.Types.ObjectId(tournamentWinner[0].userId) : null,
                    secondWinner: tournamentWinner[1]?.userId ? new mongoose.Types.ObjectId(tournamentWinner[1].userId) : null,
                    thirdWinner: tournamentWinner[2]?.userId ? new mongoose.Types.ObjectId(tournamentWinner[2].userId) : null,
                    tournamentStartTime: tournament.tournamentStartTime,
                    tournamentEndTime: tournament.tournamentEndTime
                });    

                console.log("Users has been rewarded");
            }
            await Tournament.findByIdAndUpdate(tournament._id, { status: 'ended' });
            console.log(`Tournament ${tournament._id} has ended.`);
        }

        if (tournament.status === 'ended') {
            console.log(`Deleting ${tournament._id}`)
            const deleteLeaderboard = await Leaderboard.deleteMany({ leaderboardId: tournament._id});
            console.log(`Deleted ${deleteLeaderboard.deletedCount} records with ${tournament._id}`);

            const deletedTournament = await liveTournament.deleteOne({ _id: new mongoose.Types.ObjectId(tournament._id) });
            console.log(`Deleted ${tournament._id} record from database - successful`)
        }

    }, 10 * 1000); // Every 10 seconds
}


async function handleMultipleTournaments() {
    const tournaments = await Tournament.find({ status: { $in: ['upcoming', 'active'] } });

    tournaments.forEach(tournament => {
        handleTournamentLifecycle(tournament._id);
    });

    setInterval(async () => {
        const subwaySurfers = await createNewTournament(
            "Subway Surfers",
            "./Assets/_games/_img/subway.jpeg",
            "Dodge, dash, and surf your way through busy train tracks in this epic Subway Surfers tournament! 🚄💨 Collect coins, power-ups, and boosters as you race for the highest score. It's not just about speed — it's about style, skill, and non-stop fun!",
            0,
            100,
            "./Assets/_games/_games/subwaysurfersny/index.html"
        );

        const basketballHoop = await createNewTournament(
            "Basketball Hoop",
            "./Assets/_games/_img/basketballhoop.jpg",
            "Time to show off those shooting skills! 🎯🏀 Swipe, aim, and sink as many baskets as you can before the clock runs out. The more perfect shots you hit, the higher your score — it’s all about precision and speed!",
            0,
            100,
            "./Assets/_games/_games/basketball frvr/main.html"
        );

        const chromeDino = await createNewTournament(
            "Chrome Dino",
            "./Assets/_games/_img/chromedino.jpg",
            "Jump over cacti, duck under birds, and push your reflexes to the limit in this endless runner classic. The longer you survive, the faster it gets—can you set the highest score before crashing? Get ready to tap, jump, and run like the internet never existed!",
            0,
            100,
            "./Assets/_games/_games/chromedino/main.html"
        );

        handleTournamentLifecycle(subwaySurfers._id);
        handleTournamentLifecycle(basketballHoop._id);
        handleTournamentLifecycle(chromeDino._id);
        
    }, 9.7 * 60 * 1000); // Every 9 mins 40 seconds for regular tournament

    setInterval(async () => {
            // const trivia = await createNewExclusiveTournament(
            //     "Octagames Trivia",
            //     "./Assets/_games/_img/trivia.jpeg",
            //     "Test your knowledge across multiple categories in fast-paced, fun trivia battles! Compete against friends or players worldwide, climb the leaderboards, and take on daily challenges for rewards. Who’s the trivia master? Play now and find out!",
            //     0,
            //     1000,
            //     'exclusive',
            //     'Trivia',
            //     'BrainTeaser',
            //     'QuizGame',
            //     0,
            //     './Assets/_games/_games/trivia/main.html'
            // );

            // const codm = await createNewExclusiveTournament(
            //     "Call of Duty Mobile: Single",
            //     "./Assets/_games/_img/codm.jpg",
            //     "Join the ultimate CODM showdown! Battle it out with players from around the world in intense, fast-paced matches. Test your skills, claim your victory, and rise to the top of the leaderboard. Whether you're a sharpshooter or a strategist, this tournament is your chance to prove you're the best.",
            //     0,
            //     1000,
            //     'exclusive',
            //     'CODM',
            //     'Battle Royale',
            //     'No Team',
            //     0
            // );
            
            const subwaySurfers = await createNewExclusiveTournament(
                "Exclusive Subway Surfers",
                "./Assets/_games/_img/subway.jpeg",
                "Dodge, dash, and surf your way through busy train tracks in this epic Subway Surfers tournament! 🚄💨 Collect coins, power-ups, and boosters as you race for the highest score. It's not just about speed — it's about style, skill, and non-stop fun!",
                0,
                1000,
                'exclusive',
                'Endless Runner',
                'TrainTracksMadness',
                '',
                0,
                "./Assets/_games/_games/subwaysurfersny/index.html"
            );

            const basketballHoop = await createNewExclusiveTournament(
                "Basketball Hoop",
                "./Assets/_games/_img/basketballhoop.jpg",
                "Time to show off those shooting skills! 🎯🏀 Swipe, aim, and sink as many baskets as you can before the clock runs out. The more perfect shots you hit, the higher your score — it’s all about precision and speed!",
                0,
                1000,
                'exclusive',
                'BasketballShootout',
                'ArcadeBasketball',
                '',
                0,
                "./Assets/_games/_games/basketball frvr/main.html"
            );

            handleTournamentLifecycle(subwaySurfers._id);
            handleTournamentLifecycle(basketballHoop._id);
            

        }, 15 * 60 * 1000); // Every 4 hours for exclusive tournament
}


module.exports = { createNewTournament, handleTournamentLifecycle, handleMultipleTournaments };
