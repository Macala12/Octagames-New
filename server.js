require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');
const axios = require('axios');
const base64 = require('base-64');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const path = require("path");
const app = express();
const jwt = require('jsonwebtoken');
const Flutterwave = require('flutterwave-node-v3');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: `mail.octasub.com.ng`,
  port: 465,
  secure: true,
  auth: {
    user: `no-reply@octasub.com.ng`,
    pass: `Modub_chibs`,
  },
});
const { handleMultipleTournaments } = require('./public/controllers/tournamentController');
const { startPaymentProcessor } = require('./public/controllers/paymentController');

//Models
const User = require('./public/models/User');
const UserGameInfo = require('./public/models/UserGameInfo');
const Otp = require('./public/models/Otp');
const liveTournament = require('./public/models/LiveTournament');
const Leaderboard = require('./public/models/Leaderboard');
const redeemRewardHistories = require('./public/models/RedeemRewardHistories');
const bankInfo = require('./public/models/BankInfo');
const rewardInfo = require('./public/models/RewardInfo');
const Coins = require('./public/models/Coins');
const transactionHistories = require('./public/models/Transactionhistories');
const payoutHistories = require('./public/models/PayoutHistories');
const tournamentWinner = require('./public/models/TournamentWinners');
const { error } = require("console");
const { umask } = require('process');

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Middleware to parse JSON requests
app.use(express.json());

    // Connect to MongoDB 
    mongoose.connect("mongodb+srv://michael-user-1:Modubass1212@assetron.tdmvued.mongodb.net/octagames", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log("MongoDB Connected");
        handleMultipleTournaments();
        startPaymentProcessor();
    })
    .catch(err => console.log("DB Connection Error:", err));

    //Admin Route
    app.get('/admin_user_count', async (req, res) => {
       try {
        const response = await User.find();
        if (!response) {
            return res.status(400).json({ message: 'could not get any user' })
        }
        res.status(200).json(response);
       } catch (error) {
        
       } 
    });

    app.get('/admin_total_coin', async (req, res) => {
       try {
        const response = await transactionHistories.find();
        if (!response) {
            return res.status(400).json({ message: 'could not get any coin' })
        }
        res.status(200).json(response);
       } catch (error) {
        
       } 
    });

    app.get('/admin_total_players', async (req, res) => {
        try {
        const response = await Leaderboard.find();
        if (!response) {
            return res.status(400).json({ message: 'could not get any players' })
        }
        res.status(200).json(response);
        } catch (error) {
        
        } 
    });

    app.post('/create_new_exclusive_tournament', async (req, res) => {
        try {
            const {tournamentName, tournamentImgUrl, tournamentDesc, tournamentReward, entryAmount, type, tagOne, tagTwo, tagThree, maximumPlayers, minimum_players_boolean, minimum_players, tournamentPlayUrl, tournamentStartTime, tournamentEndTime} = req.body;
            const newTournament = new liveTournament({
                tournamentName,
                tournamentImgUrl,
                tournamentDesc,
                tournamentReward,
                entryAmount,
                type,
                tagOne,
                tagTwo,
                tagThree,
                maximumPlayers,
                minimumPlayersBoolean: minimum_players_boolean,
                minimumPlayers: minimum_players,
                tournamentPlayUrl,
                tournamentStartTime,
                tournamentEndTime
            });
            await newTournament.save();

            if(!newTournament){
                return res.status(400).json({ message: 'Error Trying to add tournament' })
            }

            res.status(200).json({ message: 'Success in adding new tournament' });
        } catch (error) {
            console.log(error)
        }
    })


    //Signup Route / Endpoint
    app.post('/login/admin', async (req, res) => {
        try {
            const { email, password } = req.body;
            const findUser = await User.findOne({ email });

            if (!findUser) {
                return res.status(400).json({message: 'Invalid Email'});
            }

            if (findUser.role !== 'admin') {
                return res.status(400).json({message: 'You are not verified to enter'});  
            }

            const isMatched = await bcrypt.compare(password, findUser.password);
            if (!isMatched) {
                return res.status(400).json({message: 'Incorrect Password'});
            }

            const userId = findUser._id ? findUser._id.toString() : null;
        
            res.status(200).json({
                message: 'Login Successful',
                userid: userId
            });
        } catch (error) {
            
        }    
    });

    app.post('/signup', async (req, res) => {
        try {
            const {userImg, firstName, lastName, username, email, phoneNumber, password} = req.body;

            const existingUsername = await User.findOne({ username });
            if (existingUsername) return res.status(400).json({ message: 'Username is already taken' });

            const existingEmail = await User.findOne({ email });
            if (existingEmail) return res.status(400).json({ message: 'Email is already registered' });

            const existingPhonenumber = await User.findOne({ phoneNumber });
            if (existingPhonenumber) return res.status(400).json({ message: 'Phone Number is already registered' });

            //Hash Passward
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = new User({
                userImg,
                firstName,
                lastName,
                username,
                email,
                phoneNumber,
                showTutorial: true,
                completedTutorial: false,
                password: hashedPassword
            });
            await newUser.save();

            const newGameInfo = new UserGameInfo({
                userId: newUser._id,
                userOctacoin: 0,
                userLevel: 1,
                userXP: 0,
                userStreak: 0,
                userTopWins: 0,
                userGamesPlayed: 0
            });
            await newGameInfo.save();

            const newReward = new rewardInfo({
                _id: newUser._id,
                rewardAmount: 0,
                hasWon: false,
                lastReward: 0
            })
            await newReward.save();

            const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            const verificationLink = `https://octagames-new-production.up.railway.app/verify-email?token=${token}`;

            await transporter.sendMail({
            from: `"Octagames" <no-reply@octasub.com.ng>`,
            to: email,
            subject: "Verify Your Email",
            html: `
                <div style="width: 100%; max-width: 600px; margin: auto; font-family: 'Montserrat', sans-serif; background-color: #1a1a1a; color: #ffffff; border-radius: 10px; overflow: hidden;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0;">
                    <tr>
                        <td style="padding: 30px;">
                        <h2 style="color: #66fcf1; margin: 0 0 20px;">Verify Your Email</h2>
                        <p style="font-size: 12px; line-height: 1.6; margin: 0 0 20px;">
                            Hey there, Chief<br><br>
                            You're just one click away from entering the arena! To verify your email and activate your Octagames account, tap the button below:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationLink}" style="width: 70%; background-color: #66fcf1; color: #1a1a1a; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
                            Verify Email
                            </a>
                            <p style="font-size: 13px; color: #cccccc; margin-top: 10px;">Expires in 1hr</p>
                        </div>
                        <p style="font-size: 12px; color: #cccccc; line-height: 1.6;">
                            If you didn’t sign up for Octagames, you can safely ignore this message. Otherwise, gear up and get ready to dominate the leaderboard!
                        </p>
                        <p style="text-align: center; margin-top: 25px !important; margin-bottom: 10px !important;">
                            <a href="" style="color: #fff !important; text-decoration: none; padding-right: 15px;"><i class="fi fi-brands-facebook"></i></a>
                            <a href="" style="color: #fff !important; text-decoration: none; padding-right: 15px;"><i class="fi fi-brands-instagram"></i></a>
                            <a href="" style="color: #fff !important; text-decoration: none; padding-right: 15px;"><i class="fi fi-brands-twitter-alt-circle"></i></a>
                            <a href="" style="color: #fff !important; text-decoration: none; padding-right: 15px;"><i class="fi fi-brands-whatsapp"></i></a>
                        </p>
                        <p style="text-align: center; font-size: 12px; margin: 10px 0;">Lagos, Nigeria</p>
                        <p style="font-size: 12px; text-align: center; color: #666666; margin-top: 20px;">
                            ⚡ Powered by Octagames<br>
                            Level up your gaming experience with our competitive tournaments, rewards, and non-stop action.
                        </p>
                        </td>
                        <td style="width: 230px; background-image: url('https://octagames-new-production.up.railway.app/Assets/_games/_img/auth_background3.png'); background-size: cover; background-position: center;"></td>
                    </tr>
                    </table>
                </div>  
            `          
            });

            res.status(200).json({ message: 'User registered successfully'})

        } catch (error) {
            console.error('Error during signup:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    app.get('/check_signup_info', async (req, res) => {
        try {
            const { username } = req.query;
            const existingUsername = await User.findOne({ username });
            if (existingUsername) return res.status(400).json({ message: 'Username is already taken' });

            res.status(200).json({ message: 'new' });
        } catch (error) {
            
        }
    });

    app.get('/resend_link', async (req, res) => {
        try {
            const { email } = req.query;

            const fetchedUserId = await User.findOne({ email });
            if (!fetchedUserId) {
                return res.status(400).json({ message: 'User not found' });
            }
            
            const token = jwt.sign({ userId: fetchedUserId._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            const verificationLink = `https://octagames-new-production.up.railway.app/verify-email?token=${token}`;

            await transporter.sendMail({
            from: `"Octagames" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verify Your Email (Resend)",
            html: `
                <div style="width: 100%; max-width: 600px; margin: auto; font-family: 'Montserrat', sans-serif; background-color: #1a1a1a; color: #ffffff; border-radius: 10px; overflow: hidden;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0;">
                    <tr>
                        <td style="padding: 30px;">
                        <h2 style="color: #66fcf1; margin: 0 0 20px;">Verify Your Email</h2>
                        <p style="font-size: 12px; line-height: 1.6; margin: 0 0 20px;">
                            Hey there, Chief<br><br>
                            You're just one click away from entering the arena! To verify your email and activate your Octagames account, tap the button below:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationLink}" style="width: 70%; background-color: #66fcf1; color: #1a1a1a; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
                            Verify Email
                            </a>
                            <p style="font-size: 13px; color: #cccccc; margin-top: 10px;">Expires in 1hr</p>
                        </div>
                        <p style="font-size: 12px; color: #cccccc; line-height: 1.6;">
                            If you didn’t sign up for Octagames, you can safely ignore this message. Otherwise, gear up and get ready to dominate the leaderboard!
                        </p>
                        <p style="text-align: center; margin-top: 25px !important; margin-bottom: 10px !important;">
                            <a href="" style="color: #fff !important; text-decoration: none; padding-right: 15px;"><i class="fi fi-brands-facebook"></i></a>
                            <a href="" style="color: #fff !important; text-decoration: none; padding-right: 15px;"><i class="fi fi-brands-instagram"></i></a>
                            <a href="" style="color: #fff !important; text-decoration: none; padding-right: 15px;"><i class="fi fi-brands-twitter-alt-circle"></i></a>
                            <a href="" style="color: #fff !important; text-decoration: none; padding-right: 15px;"><i class="fi fi-brands-whatsapp"></i></a>
                        </p>
                        <p style="text-align: center; font-size: 12px; margin: 10px 0;">Lagos, Nigeria</p>
                        <p style="font-size: 12px; text-align: center; color: #666666; margin-top: 20px;">
                            ⚡ Powered by Octagames<br>
                            Level up your gaming experience with our competitive tournaments, rewards, and non-stop action.
                        </p>
                        </td>
                        <td style="width: 230px; background-image: url('https://octagames-new-production.up.railway.app/Assets/_games/_img/auth_background3.png'); background-size: cover; background-position: center;"></td>
                    </tr>
                    </table>
                </div>  
            `   
            });

            res.status(200).json({ message: 'Verication link has been resent' });

        } catch (error) {
            
        }
    });

    app.post('/otp', async (req, res) => {
       try {
        const { userid } = req.body;
        const objectuserId = new mongoose.Types.ObjectId(userid);

        const userEmail = await User.findById(objectuserId);
        if (!userEmail) {
            return res.status(400).json({ message: 'Could not find user' });
        }

        const email = userEmail.email;
        const generateOTP = () => Math.floor(100000 + Math.random() * 900000);
        const otp = generateOTP();

        await transporter.sendMail({
            from: `"Octagames" <no-reply@octasub.com.ng>`,
            to: email,
            subject: "OTP Code",
            html: `
                <div style="width: 100%; display: flex; font-family: 'Montserrat', sans-serif; border-radius: 10px; background-color: #1a1a1a; color: #ffffff; max-width: 600px; margin: auto;">
                    <div style="padding: 30px;">
                        <h2 style="text-align: left; color: #66fcf1;">Redeem Reward OTP</h2>
                        <p style="font-size: 16px; text-align: left; line-height: 1.6;">
                        Hey ${userEmail.firstName + " " + userEmail.lastName} ,<br><br>
                        To complete your redeem request please enter the OTP code provided below in the website. The code will expire in <b>15 minutes</b>
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 20px; margin-right: 10px;"><b>${otp}</b></span>
                        </div>
                        <div style="width: 90%; font-weight: 600; text-align: left; padding: 15px; background-color: #fff3cd; color:#409e98; border-radius: 10px;">
                        <i class="fi fi-rr-triangle-warning"></i> OTP code will expire in <span style="font-weight: 700;">15 minutes</span>
                        </div>
                        <p style="font-size: 14px; color: #cccccc; line-height: 1.6;">
                        You can only use the code once. If you didn't request for the security code. Kindly contact our <a href="">support team</a>
                        </p>
                        <p style="text-align: center; margin-top: 25px !important; margin-bottom: 10px !important;">
                        <a href="" style="color: #fff !important; text-decoration: none; padding-right: 15px;"><i class="fi fi-brands-facebook"></i></a>
                        <a href="" style="color: #fff !important; text-decoration: none; padding-right: 15px;"><i class="fi fi-brands-instagram"></i></a>
                        <a href="" style="color: #fff !important; text-decoration: none; padding-right: 15px;"><i class="fi fi-brands-twitter-alt-circle"></i></a>
                        <a href="" style="color: #fff !important; text-decoration: none; padding-right: 15px;"><i class="fi fi-brands-whatsapp"></i></a>
                    </p>
                        <p style="text-align: center; font-size: 14px;">
                            Lagos, Nigeria
                        </p>
                        <p style="font-size: 14px; text-align: center; color: #666666; margin-top: 20px;">
                        ⚡ Powered by Octagames <br>
                        Level up your gaming experience with our competitive tournaments, rewards, and non-stop action.
                        </p>
                    </div>
                </div>
            `
        });

        if (!transporter) {
             return console.error("Error:", error);
        }

        const newOtp = new Otp({
            email,
            otp
        });
        await newOtp.save();

        return res.status(200).json({ message: 'success' });

       } catch (error) {
        console.error(error)
       } 
    });

    app.get('/verify_otp', async (req, res) => {
        const { userid, otp } = req.query;
        try {
            const objectuserId = new mongoose.Types.ObjectId(userid);

            const userEmail = await User.findById(objectuserId);
            if (!userEmail) {
                return res.status(400).json({ message: 'Could not find user' });
            }

            const otpChecker = await Otp.findOne({ email: userEmail.email, otp: otp });
            if (!otpChecker) {
                return res.status(400).json({ message: 'Invalid OTP or OTP has expired' })
            }

            return res.status(200).json({ message: 'success' });
        } catch (err) {
            console.error(err);
            res.status(400).send('Invalid or expired OTP.');
        }
    });

    app.get('/claim_tutorial_reward', async (req, res) => {
        try {
            const { userid } = req.query;
            const objectuserId = new mongoose.Types.ObjectId(userid);
            const updateTutorial = await User.findByIdAndUpdate(
                objectuserId,
                { 
                    showTutorial: false, 
                    completedTutorial: true 
                }
            );
            if (!updateTutorial) {
                return res.status(400).json({ message: 'Could Update Tutorials' });
            }else{
                const addReward = await UserGameInfo.findOneAndUpdate( { userId: objectuserId }, {
                    $inc: { userOctacoin: 100 }
                });

                if (!addReward) {
                    return res.status(400).json({ message: 'Could add Tutorial Reward' });
                }

                return res.status(200).json({ message: 'success' });
            }
        } catch (error) {
            console.log(error);
        }
    });

    app.get('/check_skip_tutorials', async (req, res) => {
       try {
        const { userid } = req.query;
        const objectId = new mongoose.Types.ObjectId(userid);
        const check_skip_tutorials = await User.findById(objectId);
        if (!check_skip_tutorials) {
            return res.status(400).json({ message: 'Could not check tutorials' })
        }
        if (check_skip_tutorials.completedTutorial === false || check_skip_tutorials.completedTutorial === "false") {
            if (check_skip_tutorials.showTutorial === false || check_skip_tutorials.showTutorial === "false") {
                return res.status(200).json({ message: 'success' })
            }
        }
       } catch (error) {
        
       } 
    });

    app.get('/skip_tutorial', async (req, res) => {
        try {
            const { userid } = req.query;
            const objectuserId = new mongoose.Types.ObjectId(userid);
            const updateSkipTutorial = await User.findByIdAndUpdate(objectuserId, {showTutorial: false});
            if (!updateSkipTutorial) {
                return res.status(400).json({ message: 'Could Skip Tutorials' });
            }

            return res.status(200).json({ message: 'success' });
        } catch (error) {
            
        }
    });

    //Verify Email Route
    app.get('/verify-email', async (req, res) => {
        const { token } = req.query;
    
        try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
    
        await User.findByIdAndUpdate(userId, { emailConfirmed: true });
    
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Email Verified</title>
              <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  background-color: #000;
                  font-family: 'Montserrat', sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  color: white;
                }
                .container {
                  text-align: center;
                  padding: 40px;
                }
                a {
                  font-weight: 700;
                  color: #000;
                  text-decoration: none;
                  background-color: #66fcf1;
                  padding: 35px;
                  border-radius: 10px;
                  display: inline-block;
                  margin-top: 20px;
                  width: 70%;
                  font-size: 35px;
                }
                h4{
                  font-size: 40px;
                }
                p{
                  font-size: 30px
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h4>Email Verified ✨</h4>
                <p>Yay! Email has been verified. You can now join the play, win, and repeat vibe 😎</p>
                <a href="https://octagames-new-production.up.railway.app/login.html">Login</a>
              </div>
            </body>
            </html>
        `);

        } catch (err) {
        console.error(err);
        res.status(400).send(`
                        <!DOCTYPE html>
            <html>
            <head>
              <title>Email Verified</title>
              <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  background-color: #000;
                  font-family: 'Montserrat', sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  color: white;
                }
                .container {
                  text-align: center;
                }
                a {
                  font-weight: 700;
                  color: #000;
                  text-decoration: none;
                  background-color: #66fcf1;
                  padding: 15px 25px;
                  border-radius: 10px;
                  display: inline-block;
                  margin-top: 20px;
                }
                h4{
                  font-size: 40px;
                }
                p, a{
                  font-size: 30px
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h4>Invalid or Expired token</h4>
              </div>
            </body>
            </html>
        `);
        }
    });

    //Login Route / Endpoint
    app.post('/login', async (req, res) => {
        try {
            const {email, password} = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({message: 'Invalid Email'});
            }

            if (user.emailConfirmed == false) {
                return res.status(400).json({message: 'You have not verified your email'});  
            }
        
            const isMatched = await bcrypt.compare(password, user.password);
            if (!isMatched) {
                return res.status(400).json({message: 'Incorrect Password'});
            }
        
            const userId = user._id ? user._id.toString() : null;
        
            res.status(200).json({
                message: 'Login Successful',
                userid: userId
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    //Fetch Info Route / Endpoint
    app.get('/fetch_info', async (req, res) =>{
        try {
            const { userid } = req.query;

            const fetchedUser = await User.findOne({ _id: new mongoose.Types.ObjectId(userid) });
        
            if (!fetchedUser) {
                return res.status(400).json({ message: "No userid exist" });
            }else{
                res.status(200).json(fetchedUser);
            }
        } catch (error) {
            console.error('Fetching error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    //Fetch Game Info Route / Endpoint
    app.get('/fetch_game_info', async (req, res) =>{
        try {
            const { userid } = req.query;

            const fetchedUserGameInfo = await UserGameInfo.findOne({ userId: new mongoose.Types.ObjectId(userid) });
        
            if (!fetchedUserGameInfo) {
                return res.status(400).json({ message: "No userid exist" });
            }else{
                res.status(200).json(fetchedUserGameInfo);
            }
        } catch (error) {
            console.error('Fetching error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    app.get('/fetch_reward', async (req, res) =>{
        try {
            const { userid } = req.query;

            const fetchedUser = await rewardInfo.findOne({ _id: new mongoose.Types.ObjectId(userid) });
        
            if (!fetchedUser) {
                return res.status(400).json({ message: "No userid exist" });
            }else{
                res.status(200).json(fetchedUser);
            }
        } catch (error) {
            console.error('Fetching error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    //Update User Info
    app.get('/update_user', async (req, res) => {
        try {
        const { userid, email, phoneNumber, username } = req.query;
    
        const objectUserId = new mongoose.Types.ObjectId(userid);
    
        const updates = {};
    
        // Check and validate email
        if (email && email !== '') {
            const checkEmail = await User.findOne({ email });
            if (checkEmail) {
            return res.status(400).json({ message: 'Email already registered: Use another email' });
            }
            updates.email = email;
        }
    
        // Check and validate phone number
        if (phoneNumber && phoneNumber !== '') {
            const checkPhonenumber = await User.findOne({ phoneNumber });
            if (checkPhonenumber) {
            return res.status(400).json({ message: 'Phone number already registered: Use another number' });
            }
            updates.phoneNumber = phoneNumber;
        }
    
        // Check and validate username
        if (username && username !== '') {
            const checkUsername = await User.findOne({ username });
            if (checkUsername) {
            return res.status(400).json({ message: 'Username already registered: Use another username' });
            }
            updates.username = username;
        }
    
        // If there's nothing to update
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }
    
        // Update user
        const updatedUser = await User.findByIdAndUpdate(objectUserId, updates, { new: true });
        if (!updatedUser) {
            return res.status(400).json({ message: 'Unable to update user info' });
        }
    
        res.status(200).json({ message: 'Updated successfully', user: updatedUser });
        } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        }
    });

    //Update User Password
    app.get('/send_email', async (req, res) => {
        const { userid } = req.query;

        objectId = new mongoose.Types.ObjectId(userid);
        const userEmail = await User.findOne({ _id: objectId });

        if (!userEmail) {
            return res.status(400).json({ message: "User not found" });
        }

        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        });

        const token = jwt.sign({ userId: userEmail._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const verificationLink = `https://octagames-new-production.up.railway.app/update_password.html?id=${userid}`;

        await transporter.sendMail({
        from: `"Octagames" <${process.env.EMAIL_USER}>`,
        to: userEmail.email,
        subject: "Update Your Password",
        html: `
              <div style="width: 100%; display: flex; font-family: 'Montserrat', sans-serif; border-radius: 10px; background-color: #1a1a1a; color: #ffffff; max-width: 600px; margin: auto;">
                <div style="padding: 30px;">
                    <h2 style="text-align: left; color: #66fcf1;">Update Your Password</h2>
                    <p style="font-size: 16px; text-align: left; line-height: 1.6;">
                        Hey Michael,<br><br>
                        It looks like you requested to update your password. To continue, please click the button below:
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" style="background-color: #66fcf1; width: 80%; color: #1a1a1a; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
                            Update Password
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #cccccc; line-height: 1.6;">
                        If you didn’t make this request, you can safely ignore this message. Your account will remain secure.
                    </p>
                    <p style="text-align: center; margin-top: 25px !important; margin-bottom: 10px !important;">
                        <a href="" style="color: #fff !important; text-decoration: none; padding-right: 15px;"><i class="fi fi-brands-facebook"></i></a>
                        <a href="" style="color: #fff !important; text-decoration: none; padding-right: 15px;"><i class="fi fi-brands-instagram"></i></a>
                        <a href="" style="color: #fff !important; text-decoration: none; padding-right: 15px;"><i class="fi fi-brands-twitter-alt-circle"></i></a>
                        <a href="" style="color: #fff !important; text-decoration: none; padding-right: 15px;"><i class="fi fi-brands-whatsapp"></i></a>
                    </p>
                    <p style="text-align: center; font-size: 14px;">
                        Lagos, Nigeria
                    </p>
                    <p style="font-size: 14px; text-align: center; color: #666666; margin-top: 20px;">
                        ⚡ Powered by Octagames <br>
                        Level up your gaming experience with our competitive tournaments, rewards, and non-stop action.
                    </p>
                </div>
            </div>
        `
        });

        res.status(200).json({ message: 'Verication link has been resent' });
    });

    app.post('/update_password', async (req, res) => {
        try {
            const { userid, password } = req.body;

            const objectUserId = new mongoose.Types.ObjectId(userid)

            //Hash Passward
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const updatePassword = await User.findByIdAndUpdate(objectUserId, {password: hashedPassword});
            if (!updatePassword) {
                return res.status(400).json({ message: 'Cannot update password' });
            }

            res.status(200).json({ message: 'Password Updated Successfully' });
        } catch (error) {
            
        }
    });

    app.post('/change_avatar', async (req, res) => {
        try {
            const { avatarurl, userid } = req.body;
            const objectUserId = new mongoose.Types.ObjectId(userid);

            const updateAvatar = await User.findByIdAndUpdate(objectUserId, { userImg: avatarurl });
            if (!updateAvatar) {
                return res.status(400).json({ message: 'Cannot update avatar' });
            }

            res.status(200).json({ message: 'Avatar Updated Successfully' });

        } catch (error) {
            
        }
    });

    app.get('/forgot_password', async (req, res) => {
        try {
            const { email } = req.query;

            const checkEmail = await User.findOne({ email });
            if (!checkEmail) {
                return res.status(400).json({ message: 'Invalid Email' })
            }

            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            });

            const verificationLink = `https://octagames-new-production.up.railway.app/update_forgot_password.html?email=${email}&userid=${checkEmail._id}`;
            await transporter.sendMail({
            from: `"Octagames" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Forgot Your Password",
            html: `
                  <div style="width: 100%; display: flex; font-family: 'Montserrat', sans-serif; border-radius: 10px; background-color: #1a1a1a; color: #ffffff; max-width: 600px; margin: auto;">
                    <div style="padding: 30px;">
                        <h2 style="text-align: left; color: #66fcf1;">Forgot Your Password</h2>
                        <p style="font-size: 16px; text-align: left; line-height: 1.6;">
                            Hey ${checkEmail.firstName},<br><br>
                            We received a request to reset your Octagames account password. Don’t worry — we’ve got you covered.
                            To update your password securely, just click the button below:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationLink}" style="background-color: #66fcf1; width: 80%; color: #1a1a1a; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
                                Update Password
                            </a>
                        </div>
                        <p style="font-size: 14px; color: #cccccc; line-height: 1.6;">
                            If you didn’t make this request, you can safely ignore this message. Your account will remain secure.
                        </p>
                        <p style="text-align: center; margin-top: 25px !important; margin-bottom: 10px !important;">
                            <a href="" style="color: #fff !important; text-decoration: none; padding-right: 15px;"><i class="fi fi-brands-facebook"></i></a>
                            <a href="" style="color: #fff !important; text-decoration: none; padding-right: 15px;"><i class="fi fi-brands-instagram"></i></a>
                            <a href="" style="color: #fff !important; text-decoration: none; padding-right: 15px;"><i class="fi fi-brands-twitter-alt-circle"></i></a>
                            <a href="" style="color: #fff !important; text-decoration: none; padding-right: 15px;"><i class="fi fi-brands-whatsapp"></i></a>
                        </p>
                        <p style="text-align: center; font-size: 14px;">
                            Lagos, Nigeria
                        </p>
                        <p style="font-size: 14px; text-align: center; color: #666666; margin-top: 20px;">
                            ⚡ Powered by Octagames <br>
                            Level up your gaming experience with our competitive tournaments, rewards, and non-stop action.
                        </p>
                    </div>
                </div>
            `
            });
            res.status(200).json({ message: 'User registered successfully'});

        } catch (error) {
            
        }
    });

    app.get('/update_level', async (req, res) => {
       try {
         const { userid } = req.query;

         const objectuserId = new mongoose.Types.ObjectId(userid);
         const newLevel = await UserGameInfo.findByIdAndUpdate(objectuserId, { $inc: { userLevel: 1 } })
         if (!newLevel) {
            return res.status(400).json({message: "Failed with error 400"});
         }
       } catch (error) {
        
       } 
    });

// Coins Logics ---------------------------------------------------------------//
    app.get('/fetch_coins', async (req, res) => {
        try {
            const coin = await Coins.find();

            if (!coin) {
                return res.status(404).json({ message: "No Coins avaliable" });
            }else{
                res.json(coin);
            }
        } catch (error) {
            console.error('Error Occured', error);
            res.status(500).json({message: 'Internal Server Error'});
        }
    });

// Tournament Logics ---------------------------------------------------------------//
    app.post('/new_tournaments', async (req, res) => {
        try {
            const { tournamentName, tournamentImgUrl, tournamentReward, tournamentStartTime, tournamentEndTime } = req.body;

            const newTournament = new liveTournament({
                tournamentName,
                tournamentImgUrl,
                tournamentReward
            });

            await newTournament.save();

            res.status(200).json({message: "Added Successfully"});
        } catch (error) {
            
        }
    });

    app.get('/fetch_top_player', async (req, res) => {
       try {
        const topPlayers = await UserGameInfo.find().sort({ userTopWins: -1 }).limit(5).exec();
        if (!topPlayers) {
            return res.status(404).json({ message: "No top players" });
        }

        const topPlayerUserInfos = await Promise.all(
            topPlayers.map(player => User.findOne({ _id: player.userId }))
        );
        
        res.json(topPlayerUserInfos);

       } catch (error) {
        
       } 
    });

    app.get('/fetch_exclusive_tournaments', async (req, res) => {
        try {
            const exclusivetournament = await liveTournament.find({ type: 'exclusive' });

            if (!exclusivetournament) {
                return res.status(404).json({ message: "No Exclusive tournament avaliable" });
            }else{
                res.json(exclusivetournament);
            }
        } catch (error) {
            console.error('Error Occured', error);
            res.status(500).json({message: 'Internal Server Error'});
        }
    });

    app.get('/fetch_live_tournaments', async (req, res) => {
        try {
            const  { userid } = req.query;
            const livetournament = await liveTournament.find({ status: 'active', type: 'regular' });

            if (livetournament.length === 0) {
                return res.status(404).json({ message: "No live tournament available" });
            } else {
                // Create a new array of plain objects
                const updatedTournaments = [];

                for (const tournament of livetournament) {
                    const isJoined = await Leaderboard.findOne({ userId: userid, leaderboardId: tournament._id });

                    // Convert tournament to a plain object
                    const tournamentObj = tournament.toObject();

                    // Add the message property
                    tournamentObj.message = isJoined ? 'Joined 😤' : 'Open';

                    updatedTournaments.push(tournamentObj);
                }

                res.json({ livetournament: updatedTournaments });
            }
            
        } catch (error) {
            console.error('Error Occured', error);
            res.status(500).json({message: 'Internal Server Error'});
        }
    });

    app.get('/fetch_upcoming_tournaments', async (req, res) => {
        try {
            const  { userid } = req.query;
            const livetournament = await liveTournament.find({ status: 'upcoming', type: 'regular' });

            if (livetournament.length === 0) {
                return res.status(404).json({ message: "No live tournament available" });
            } else {
                // Create a new array of plain objects
                const updatedTournaments = [];

                for (const tournament of livetournament) {
                    const isJoined = await Leaderboard.findOne({ userId: userid, leaderboardId: tournament._id });

                    // Convert tournament to a plain object
                    const tournamentObj = tournament.toObject();

                    // Add the message property
                    tournamentObj.message = isJoined ? 'Joined 😤' : 'Open';

                    updatedTournaments.push(tournamentObj);
                }

                res.json({ livetournament: updatedTournaments });
            }
        } catch (error) {
            console.error('Error Occured', error);
            res.status(500).json({message: 'Internal Server Error'});
        }
    });

    app.get('/fetch_active_tournament', async (req, res) => {
        try {
            const { userid } = req.query;

            const userInGames = await Leaderboard.find({ userId: userid });

            if (!userInGames) {
                return res.status(400).json({ message: "No active game" });
            }

            const leaderboardIds = userInGames.map(entry => entry.leaderboardId);
        
            const tournaments = await liveTournament.find({ _id: { $in: leaderboardIds } });
        
            const tournamentMap = {};
            tournaments.forEach(t => {
            tournamentMap[t._id.toString()] = t;
            });
        
            const combined = userInGames.map(entry => {
            return {
            tournament: tournamentMap[entry.leaderboardId.toString()] || null
            };
        });
        
        res.status(200).json(combined);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }

    });

    app.get('/check_user_is_joined', async (req, res) => {
        const { userId, id} = req.query;
        // Check if the user is already registered in the leaderboard
        const leaderboardUserId = await Leaderboard.findOne({ userId: userId, leaderboardId: id });
        if (leaderboardUserId) {
            return res.status(200).json({ message: "joined" });
        }else{
            return res.status(200).json({ message: "notJoined" });
        }
    });
 
    app.get('/tournament_page', async (req, res) => {
        try {
            const { Id } = req.query;
            const objectid = new mongoose.Types.ObjectId(Id)
            const fetchedInfo = await liveTournament.findOne({_id: objectid});
            if (!fetchedInfo) {
                return res.status(400).json({ message: "No Tournament does not exist" });
            }
            if (fetchedInfo.status == "ended") {
                return res.status(400).json({ 
                    message: "Tournament has ended", 
                    status: "ended" 
                  });
            }
            res.status(200).json(fetchedInfo);   
        } catch (error) {
            console.error('Fetching error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    app.get('/tournament_winners', async (req, res) => {
        try {
            const { id } = req.query;

            const objectId = new mongoose.Types.ObjectId(id);

            const tournamentWinners = await tournamentWinner.findOne({ tournamentId: objectId });

            if (!tournamentWinners) {
                return res.status(400).json({ message: 'No player in tournament' });
            }

            if (tournamentWinners.length === 0) {
                return res.status(400).json({ message: 'No player in tournament' });
            }

            // Get user IDs from the winners array
            const firstWinnerId = tournamentWinners?.firstWinner ? new mongoose.Types.ObjectId(tournamentWinners.firstWinner) : null;
            const secondWinnerId = tournamentWinners?.secondWinner ? new mongoose.Types.ObjectId(tournamentWinners.secondWinner) : null;
            const thirdWinnerId = tournamentWinners?.thirdWinner ? new mongoose.Types.ObjectId(tournamentWinners.thirdWinner) : null;


            const [firstWinnerInfo, secondWinnerInfo, thirdWinnerInfo] = await Promise.all([
                firstWinnerId ? User.findById(firstWinnerId) : null,
                secondWinnerId ? User.findById(secondWinnerId) : null,
                thirdWinnerId ? User.findById(thirdWinnerId) : null
            ]);

            if (!firstWinnerInfo && !secondWinnerInfo && !thirdWinnerInfo) {
                return res.status(400).json({ message: 'No Winners in tournament' });
            }

            return res.status(200).json({
                firstWinner: firstWinnerInfo,
                secondWinner: secondWinnerInfo,
                thirdWinner: thirdWinnerInfo
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Something went wrong', error: error.message });
        }

    })

    app.get('/topScore', async (req, res) => {
        try {
            const { id } = req.query;
            const topScore = await Leaderboard.find({ leaderboardId: id }).sort({ score: -1}).limit(3).exec();
            if (!topScore) {
                return res.status(400).json({ message: 'Could not get top score' });
            }

            return res.status(200).json(topScore);
        } catch (error) {
            
        }
    });

    app.get('/joined_users', async (req, res) => {
    const { id } = req.query;
    const fetchedLeaderboard = await Leaderboard.countDocuments({leaderboardId: id});
    if (!fetchedLeaderboard) {
        return res.status(400).json({ message: "No user in tournament yet" });
    }
    res.status(200).json(fetchedLeaderboard);
    });
    
    //Fetch Leaderboard
    app.get('/getLeaderboard', async (req, res) => {
        try {
            const { Id, tag } = req.query;
            const objectId =  new mongoose.Types.ObjectId(Id);
            const fetchedLeaderboard = await Leaderboard.find({leaderboardId: Id}).sort({ score: -1 }).exec();
            const fetchTournamentReward = await liveTournament.findById(objectId);
            res.status(200).json({leaderboard: fetchedLeaderboard, number: fetchedLeaderboard.length, reward: fetchTournamentReward.tournamentReward});
        } catch (error) {
            console.error('Fetching error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    //Add user to tournament
    app.get('/join_tournament', async (req, res) => {
        try {
            const { userid, id } = req.query;

            const objectId = new mongoose.Types.ObjectId(id);
            const getTournamentEntryfee = await liveTournament.findById(objectId);

            if (!getTournamentEntryfee) {
                return res.status(404).json({ message: "No such tournament exists" });
            }

            if (getTournamentEntryfee.type === 'exclusive') {
                if (getTournamentEntryfee.playerJoinedCount === getTournamentEntryfee.maximumPlayers ) {
                    return res.status(400).json({ message: 'Maximum Number of player joined' })
                }
            }

            const playerCountChecker = await Leaderboard.find({ leaderboardId: id });
            if (!playerCountChecker) {
                return res.status(400).json({ message: "Could not find leaderBoard" });
            }

            const playerCount = playerCountChecker.length;
            if(playerCount === getTournamentEntryfee.maximumPlayers){
                return res.status(400).json({ message: "Total Maximum Players Reached" });
            }

            const entryfee = getTournamentEntryfee.entryAmount;

            // Check if user coin is enough to join the tournament
            const objectUserId = new mongoose.Types.ObjectId(userid);
            const getUserCoin = await UserGameInfo.findOne({userId: objectUserId});
            if (!getUserCoin) {
                return res.status(400).json({ message: "Unable to find user" });
            }

            const userOctacoin = getUserCoin.userOctacoin;
            if (userOctacoin < entryfee) {
                return res.status(400).json({ message: "Octacoin is too low to join tournament" });
            }else{
                const newUserOctacoin = userOctacoin - entryfee;
                // Check if the user is already registered in the leaderboard
                const leaderboardUserId = await Leaderboard.findOne({ userId: userid, leaderboardId: id });
                if (leaderboardUserId) {
                    return res.status(400).json({ message: "Unable to add user: User is already registered" });
                }
                else {

                    // Convert userId to ObjectId to search for the user
                    const userName = await User.findOne({ _id: objectUserId });

                    // If user is not found
                    if (!userName) {
                        return res.status(400).json({ message: "No user found" });
                    }

                    // Create a new leaderboard entry for the user
                    const joinTournament = new Leaderboard({
                        leaderboardId: id,
                        userId: userid,
                        username: userName.username,
                        userImg: userName.userImg,
                        played: 0,
                        score: 0,
                        status: '<i class="fi fi-rr-menu-dots"></i>'
                    });

                    // Save the user to the leaderboard
                    await joinTournament.save();

                    const fetchedTournamentReward = await liveTournament.findOne({ _id: objectId });
                    if (!fetchedTournamentReward) {
                        return res.status(400).json({ message: "No tournament found" });
                    }

                    //Increase tournament reward
                    const tournamentReward = fetchedTournamentReward.tournamentReward;
                    const updateReward = await liveTournament.findByIdAndUpdate(fetchedTournamentReward._id,  
                        {
                        $inc: {
                          tournamentReward: entryfee,
                          playerJoinedCount: 1
                        }
                      });

                    if (!updateReward) {
                        return res.status(400).json({ message: "Could not update reward" });
                    }

                    // Increase XP & Games Played
                    const getXp = await UserGameInfo.findOne({ userId: objectUserId })
                    if (!getXp) {
                        return res.status(400).json({ message: "No user found" });
                    }
                    const userXp = getXp.userXP;
                    const newUserXp = userXp + 2;
                    const updateXp = await UserGameInfo.findByIdAndUpdate(getXp._id,
                        {
                          $set: {
                            userXP: newUserXp,
                            userOctacoin: newUserOctacoin,
                          },
                          $inc: {
                            userGamesPlayed: 1
                          }
                        });
                    if (!updateXp) {
                        return res.status(400).json({ message: "Error Could not update XP" });
                    }

                    // Respond with success
                    res.status(200).json({ message: "User added successfully" });
                }
            }
        } catch (error) {
            // Handle any errors that occur during the try block
            console.error(error);
            res.status(500).json({ message: "Server error, please try again later" });
        }
    });

    app.get('/update_user_score', async (req, res) => {
        try {
            const { gameScore, userid, leaderboardId } = req.query;

            const getLeaderboard = await Leaderboard.findOne({leaderboardId, userId: userid});
            if (!getLeaderboard) {
                return res.status(400).json({ message: 'Could not get score' });
            }

            if (gameScore < getLeaderboard.score) {
                const updateStatus = await Leaderboard.findByIdAndUpdate(
                    getLeaderboard._id,
                    { status: '<i class="fi fi-rr-caret-up text-success"></i>' }
                );

                if (!updateStatus) {
                    return res.status(400).json({ message: 'Could not update score' });
                }
                 // Get all leaderboard entries sorted by score (highest first)
                 const sortedLeaderboard = await Leaderboard.find().sort({ score: -1 });
                
                 // Find the index/position of the updated user
                 const position = sortedLeaderboard.findIndex(entry => entry._id.toString() === getLeaderboard._id.toString()) + 1;
                 
                 return res.json({
                     ...getLeaderboard._doc, 
                     position              
                 });
            }else{
                const updateScore = await Leaderboard.findByIdAndUpdate(
                    getLeaderboard._id,
                    { score: gameScore },
                    {status: '<i class="fi fi-rr-caret-up text-success"></i>'},
                    { new: true }
                );
                
                if (!updateScore) {
                    return res.status(400).json({ message: 'Could not update score' });
                }
                
                // Get all leaderboard entries sorted by score (highest first)
                const sortedLeaderboard = await Leaderboard.find({leaderboardId: leaderboardId}).sort({ score: -1 });
                
                // Find the index/position of the updated user
                const position = sortedLeaderboard.findIndex(entry => entry._id.toString() === updateScore._id.toString()) + 1;
                
                res.status(200).json({
                    ...updateScore._doc, 
                    position              
                });
                
            }
        } catch (error) {
            console.error("Error Updating Score", error)
        }
    }); 

// Korapay Logics -------------------------------------------------------------------------//
    app.get('/fetch_bank', async (req, res) => {
        var config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://api.korapay.com/merchant/api/v1/misc/banks?countryCode=NG',
        headers: { 
            'Authorization': 'Bearer pk_test_bZPeyZAuUhUi3P1uev3p4WVP7F1ev7vDXbDKDKkz', 
            'Content-Type': 'application/json'
        }
        };
    
        try {
        const response = await axios(config);
        const result = response.data;
    
        console.log(response.data.message);
    
        if (response.data.message === "Successful") {
            return res.status(200).json(result);
        } else {
            return res.status(500).json({ error: "Failed to fetch bank data." });
        }
        } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "An error occurred while fetching banks." });
        }
    });

    app.post('/fetch_bank_account', async (req, res) => {
        try {
            const { bank, account } = req.body;
            
            console.log(bank, account);
            
            var data = JSON.stringify({
                "bank": bank,
                "account": account
            });
    
            var config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://api.korapay.com/merchant/api/v1/misc/banks/resolve',
                headers: { 
                  'Content-Type': 'application/json'
                },
                data : data
            };
        
            try {
            const response = await axios(config);
            const result = response.data;
        
            console.log(response.data.message);
            console.log(result);
        
            if (response.data.message == "Request completed") {
                return res.status(200).json(result);
            } else {
                return res.status(500).json({ error: "Failed to fetch bank data." });
            }
            } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "An error occurred while fetching banks." });
            }
        } catch (error) {
            console.error('Error fetching bank account: ', error)
        }
    });

    app.post('/reedem_reward', async (req, res) => {
        try {
            const { reference, userid, amount, bankname, bank, account, accountname, name, email } = req.body;
                    
            var data = JSON.stringify({
                "reference": reference,
                "destination": {
                  "type": "bank_account",
                  "amount": amount,
                  "currency": "NGN",
                  "narration": "Test Transfer Payment",
                  "bank_account": {
                    "bank": bank,
                    "account": account
                  },
                  "customer": {
                    "name": name,
                    "email": email
                  }
                }
            });
    
            var config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://api.korapay.com/merchant/api/v1/transactions/disburse',
                headers: { 
                    'Authorization': 'Bearer sk_live_ptDSddv11sZQyXTcq7cx3zYwmbZtbMa54u7biNmo', 
                    'Content-Type': 'application/json'
                },
                data : data
            };
        
            try {
                objectUserId = new mongoose.Types.ObjectId(userid)
                const response = await axios(config);
                const result = response.data;
            
                console.log(response.data.message);
                console.log(result);
            
                if (response.data.status == true) {
                    const newPayoutHistory = new payoutHistories({
                        reference: reference,
                        status: result.data.status,
                        userid: objectUserId,
                        bankName: bankname,
                        accountNo: account,
                        accountName: accountname,
                        amount: amount
                    });
                    await newPayoutHistory.save();

                    return res.status(200).json(result);
                } else {
                    return res.status(500).json({ error: "Failed to fetch bank data." }, result);
                }
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: "An error occurred while fetching banks." });
            }

        } catch (error) {
            console.error('Error fetching bank account: ', error)
        }
    });

    app.post('/buy_coin', async (req, res) => {
        const { coinid, redirect_url, reference, name, email } = req.body;

        objectCoinId = new mongoose.Types.ObjectId(coinid)
        const coin = await Coins.findById(objectCoinId);
        if (!coin) {
            return res.status(200).json({ message: 'Coin not valid' });
        }


        var data = `{\n    "amount": ${coin.nairaAmount},\n    "redirect_url": "${redirect_url}",\n    "currency": "NGN",\n    "reference": "${reference}",\n    "narration": "Payment for Octacoin",\n    "merchant_bears_cost": true,\n    "customer": {\n        "name": "${name}",\n        "email": "${email}"\n    },\n    "notification_url": "http://localhost:3000/webhook/korapay"\n}`;
        
        var config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.korapay.com/merchant/api/v1/charges/initialize',
            headers: {
                'Authorization': 'Bearer sk_live_ptDSddv11sZQyXTcq7cx3zYwmbZtbMa54u7biNmo', 
                'Content-Type': 'application/json'
            },
            data : data
        };
        
        try {
            const response = await axios(config);
            const result = response.data;
        
            console.log(result);
        
            if (response.data.status == true) {
                return res.status(200).json(result);
            } else {
                return res.status(500).json({ error: "Failed to fetch bank data." }, result);
            }
        } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "An error occurred while fetching banks." });
        }
        
    })

    app.post('/buy_coin_rewards', async (req, res) => {
        try {
            const { coinid, reference, userid } = req.body;

            objectCoinId = new mongoose.Types.ObjectId(coinid)
            const coin = await Coins.findById(objectCoinId);
            if (!coin) {
                return res.status(400).json({ message: 'Coin not valid' });
            }

            objectUserId = new mongoose.Types.ObjectId(userid)
            const userReward = await rewardInfo.findById(objectUserId);
            if (!userReward) {
                return res.status(400).json({ message: 'no user with rewards found' });
            }

            const reward = userReward.rewardAmount;
            const coinNaira = coin.nairaAmount;

            if (coin.bonus == true) {
                var coinAmount = coin.coinAmount + coin.bonusAmount * 100;
            }else{
                var coinAmount = coin.coinAmount;
            }
            

            if (coinNaira > reward) {
                return res.status(400).json({ message: 'Not enough amount in rewards' });
            }else{
                const newReward = reward - coinNaira;
                const userReward = await rewardInfo.findByIdAndUpdate(objectUserId, {rewardAmount: newReward});
                if (!userReward) {
                    return res.status(400).json({ message: 'Error updating rewards' });
                }

                const updateUserCoin = await UserGameInfo.findOneAndUpdate({ userId: objectUserId }, { $inc: { userOctacoin: coinAmount } });
                if (!updateUserCoin) {
                    return res.status(200).json({ message: 'Could not update coins' });
                }

                const newTransactionHistory = new transactionHistories({
                    reference: reference,
                    status: 'success',
                    userid: objectUserId,
                    amount: coin.nairaAmount,
                    paymentfromAccNo: null,
                    paymentfromBankName: 'Paid from rewards',
                    paymentfromName: null
                });
                await newTransactionHistory.save();
            
                return res.status(200).json({ message: 'success' });
            }

        } catch (error) {
            
        }
        
    })

    app.get('/verify_payment', async (req, res) => {
        const { userid, id, reference } = req.query;

        objectCoinId = new mongoose.Types.ObjectId(id)
        const coin = await Coins.findById(objectCoinId);
        if (!coin) {
            return res.status(200).json({ message: 'Coin not valid' });
        }

        if (coin.bonus == true) {
            var coinAmount = coin.coinAmount + coin.bonusAmount * 100;
        }else{
            var coinAmount = coin.coinAmount;
        }
        
        axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
          headers: {
            Authorization: `Bearer ${process.env.PYK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          }
        })
        .then(async (response) => {
          console.log(response.data);
          if (response.data.data.status === 'success') {
            const key = 1;
            if (key == 1) {
                objectuserId = new mongoose.Types.ObjectId(userid)
                const updateUserCoin = await UserGameInfo.findOneAndUpdate({ userId: objectuserId }, { $inc: { userOctacoin: coinAmount } });
                if (!updateUserCoin) {
                    return res.status(200).json({ message: 'could not update coins' });
                }

                const newTransactionHistory = new transactionHistories({
                    reference: reference,
                    status: response.data.data.status,
                    userid: objectuserId,
                    amount: coin.nairaAmount,
                    paymentfromAccNo: response.data.data.authorization.account_name || null,
                    paymentfromBankName: response.data.data.authorization.bank,
                    paymentfromName: response.data.data.customer.email
                });
                await newTransactionHistory.save();

                return res.status(200).json({ message: response.data.data });
            }
        } else {
            return res.status(500).json({ error: "Failed to fetch payment data." });
        }
        })
        .catch(error => {
          console.error(error.response ? error.response.data : error.message);
        });          
    });

    app.get('/verify_payout', async(req, res) => {
        const { userid, id, reference } = req.query;

        var config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://api.korapay.com/merchant/api/v1/transactions/${reference}`,
            headers: { 
              'Authorization': 'Bearer sk_live_ptDSddv11sZQyXTcq7cx3zYwmbZtbMa54u7biNmo'
            }
        };

        try {
            const response = await axios(config);
            const result = response.data;
        
            console.log(result);
        
            if (result.status == true) {
                if (result.data.status == 'success') {
                    const updateHistory = await payoutHistories.findOneAndUpdate({reference: reference}, {status: result.data.status, updatedAt: Date.now})
                    if (!updateHistory) {
                        return res.status(400).json({ message: 'Could not update history' })
                    }

                    return res.status(200).json(result.data);
                }
            } else {
                return res.status(500).json({ error: "Failed to fetch payment data." }, result);
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "An error occurred while fetching banks." });
        }
    });
  
    app.post('/webhook/korapay', async (req, res) => {
        try {
          const event = req.body;
      
          console.log('🔔 Korapay Webhook received:', event);
      
          // Optionally verify the event (if Korapay supports it with a secret hash or signature)
          
          if (event.event === "charge.success") {
            const paymentDetails = event.data;
      
            const reference = paymentDetails.reference;
            const amount = paymentDetails.amount;
            const customerEmail = paymentDetails.customer.email;
      
            // Update transaction in your database here
            console.log(`✅ Payment successful. Ref: ${reference}, Amount: ${amount}`);
      
            // Send 200 OK to acknowledge receipt
            return res.status(200).json({ status: 'success' });
          }
      
          res.status(200).json({ status: 'ignored', message: 'Event not relevant' });
        } catch (error) {
          console.error('❌ Error handling Korapay webhook:', error.message);
          res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        }
    });

    //Paystack Transfer / Payout
    app.post('/paystack_payin', async (req, res) => {
        try {
            const { coinid, redirect_url, name, email } = req.body;

            objectCoinId = new mongoose.Types.ObjectId(coinid)
            const coin = await Coins.findById(objectCoinId);
            if (!coin) {
                return res.status(200).json({ message: 'Coin not valid' });
            }

            const url = 'https://api.paystack.co/transaction/initialize';

            const data = {
            email: email,
            amount: coin.nairaAmount * 100,
            callback_url: `https://octagames-new-production.up.railway.app/verify_payment.html?id=${coinid}`
            };

            axios.post(url, data, {
            headers: {
                'Authorization': `Bearer ${process.env.PYK_SECRET_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            })
            .then(response => {
            console.log('Transaction initialized:', response.data);
            return res.status(200).json({ message: response.data })
            })
            .catch(error => {
            console.error('Error initializing transaction:', error.response?.data || error.message);
            });

        } catch (error) {
            
        }
    });

    app.post('/paystack_payout', async (req, res) => {
        const { userid, amount, bankName, accountNo, accountName } = req.body;
        const userRecipient = await bankInfo.findOne({ userid: userid });
        if (!userRecipient) {
            return res.status(400).json({ message: 'User Bank Details could not be found' });
        }

        let myuuid = uuidv4();

        const data = {
            source: 'balance',
            amount: `${amount}`,
            reference: `${myuuid}`,
            recipient: `${userRecipient.recipientCode}`,
            reason: 'Testing Transfer'
        };

        axios.post('https://api.paystack.co/transfer', data, {
        headers: {
            Authorization: `Bearer ${process.env.PYK_SECRET_KEY}`,  // Replace SECRET_KEY with your actual secret key
            'Content-Type': 'application/json'
        }
        })
        .then(async (response) => {
            console.log(response.data);
            const responseData = response.data;
        
            if (responseData.data.status === 'success') {
                const objectUserId = new mongoose.Types.ObjectId(userid);
        
                // Await the user reward wallet
                const userRewardWallet = await rewardInfo.findById(objectUserId);
                if (!userRewardWallet) {
                    return res.status(400).json({ message: 'No User Reward Found' });
                }
        
                const newRewardBalance = userRewardWallet.rewardAmount - amount;
        
                // Await the update
                const updateRewardWallet = await rewardInfo.findByIdAndUpdate(
                    objectUserId,
                    { rewardAmount: newRewardBalance }
                );
        
                if (!updateRewardWallet) {
                    return res.status(400).json({ message: 'Could Not update User Wallet' });
                }
        
                const newPayoutHistory = new payoutHistories({
                    reference: myuuid,
                    status: 'processing',
                    userid: objectUserId,
                    bankName: bankName,
                    accountNo: accountNo,
                    accountName: accountName,
                    amount: amount
                });
        
                await newPayoutHistory.save();
        
                return res.status(200).json({ message: 'success' });
            } else {
                return res.status(400).json({ message: 'failed' });
            }
        })
        .catch((error) => {
            console.error('Payout Error:', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        });        
    });

    app.get('/verify_paystack_payout', async (req, res) => {
        try {
            const { reference } = req.query;
            const url = `https://api.paystack.co/transfer/verify/${reference}`;
        
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${process.env.PYK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
        
            console.log('Transfer verification result:', response.data.data.status);
        
            if (response.data.data.status === 'success') {
                const updatePayoutStatus = await payoutHistories.findOneAndUpdate(
                    { reference: reference },
                    { status: 'success' }
                );
        
                if (!updatePayoutStatus) {
                    return res.status(400).json({ message: 'Could not update payout status' });
                }
        
                return res.status(200).json({ message: 'success' });
            } else {
                return res.status(200).json({ message: 'Transfer not yet successful' });
            }
        
        } catch (error) {
            console.error('Error verifying transfer:', error.response?.data || error.message);
            return res.status(500).json({ message: 'Failed to verify transfer' });
        }
    });

    app.post('/flutterwave_payout', async (req, res) => {
        const flw = new Flutterwave(
            process.env.FLW_PUBLIC_KEY,
            process.env.FLW_SECRET_KEY
        );
        const details = {
            account_bank: '50211',
            account_number: '1234567890',
            amount: 100,
            currency: 'NGN',
            narration: 'Testing Payment',
            reference: 'dfs23fhr7ntg0293039_PMCK',
        };
        flw.Transfer.initiate(details)
        .then(console.log)
        .catch(console.log);
    });

    //Monnify Payout / Transfer
    app.post('/monnify_transfer', async (req, res) => {
        const url = `${baseURl}/api/v2/disbursements/single`;

        const { reference, userid, amount, bankname, bank, account, accountname} = req.body;
    
        
        // Transaction data to send in the request body
        const transactionData = {
            "amount": `${amount}`,
            "reference": `${reference}`,
            "narration": "Redeem Reward",
            "destinationBankCode": `${bank}`,
            "destinationAccountNumber": `${account}`,
            "currency": "NGN",
            "sourceAccountNumber": "2926745847",
            "async": true
        };
    
        try {
            // Sending the POST request with transaction data
            const response = await axios.post(url, transactionData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
    
            // Handle the response
            console.log('Response:', response.data);
            if (response.data.responseMessage === 'success') {

                objectUserId = new mongoose.Types.ObjectId(userid)

                const userRewardWallet = await rewardInfo.findById(objectUserId);
                if (!userRewardWallet) {
                    return res.status(400).json({ message: 'No User Reward Found' });
                }

                const newRewardBalance = userRewardWallet.rewardAmount - amount;

                const updateRewardWallet = await rewardInfo.findByIdAndUpdate(objectUserId, { rewardAmount: newRewardBalance });
                if (!updateRewardWallet) {
                    return res.status(400).json({ message: 'Could Not update User Wallet' });
                }

                const newPayoutHistory = new payoutHistories({
                    reference: reference,
                    status: 'processing',
                    userid: objectUserId,
                    bankName: bankname,
                    accountNo: account,
                    accountName: accountname,
                    amount: amount
                });
                await newPayoutHistory.save();

                res.status(200).json(response.data);
            } else {
                return res.status(500).json({ error: "Failed to fetch bank data." }, result);
            }
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
            res.status(500).json({ error: error.message }); // Send error response
        }
    });

    app.post('/verify_monnify_payout', async (req, res) => {
        const { reference } = req.query;
        const url = `${baseURl}/api/v2/disbursements/single/summary?reference=${reference}`;
        
        axios.get(url, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        })
        .then(response => {
          console.log('Response:', response.data);
          if (response.data.responseBody === 'SUCCESS') {
            const updatePayoutStatus = payoutHistories.findOneAndUpdate(reference, {status: 'success'});
            if(!updatePayoutStatus) return res.status(400).json({ message: 'Could not Update Payout Status' });
            res.status(200).json({ message: 'success' });
          }
        })
        .catch(error => {
          console.error('Error:', error.response ? error.response.data : error.message);
        }); 
    });

    app.post("/my/webhook/url", function(req, res) {
        //validate event
        const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
        if (hash == req.headers['x-paystack-signature']) {
        // Retrieve the request's body
        const event = req.body;
        // Do something with event
        if (event.event == 'transfer.success') {
            
        }  
        }
        res.send(200);
    });

// Reward Logic -------------------------------------------------------------------------//
    app.get('/reward_hover', async (req, res) => {
        const { userid } = req.query;
        const objectUserId = new mongoose.Types.ObjectId(userid);

        const hasWonChecker = await rewardInfo.findById(objectUserId);
        if (!hasWonChecker) {
            return res.status(400).json({ message: 'No rewards record found' });
        }

        if (hasWonChecker.hasWon == false) {
            return res.status(400).json({ message: 'Has not won any reward' });
        }

        return res.status(200).json(hasWonChecker);
    });

    app.get('/reward_hover_close', async (req, res) => {
        const { userid } = req.query;
        const objectUserId = new mongoose.Types.ObjectId(userid);

        const hasWonChecker = await rewardInfo.findByIdAndUpdate(objectUserId, {hasWon: false});
        if (!hasWonChecker) {
            return res.status(400).json({ message: 'No rewards record found' });
        }

        return res.status(200).json({ message: hasWonChecker.hasWon });
    });

    app.get('/fetch_user_reward', async (req, res) => {
        try {
            const { userid } = req.query;

            objectUserId = new mongoose.Types.ObjectId(userid);

            const fetchedReward = await rewardInfo.findOne({ _id: objectUserId });

            if (!fetchedReward) {
                return res.status(400).json({ message: 'No rewards found' })
            }

            res.status(200).json(fetchedReward);
        } catch (error) {
            
        }
    });

    app.get('/get_reward_info', async (req, res) => {
       try {
        const { userid } = req.query;

        const objectUserId = new mongoose.Types.ObjectId(userid);
        const fetchUserRewardInfo = await redeemRewardHistories.find({userid: objectUserId}).sort({ gameDateTime: -1 });

        if (!fetchUserRewardInfo) {
            return res.status(400).json({ message: 'No Rewards avaliable' });
        }

        res.status(200).json(fetchUserRewardInfo);

       } catch (error) {
            console.error(error);
       } 
    });

    app.get('/get_payout_info', async (req, res) => {
        try {
         const { userid } = req.query;
 
         const objectUserId = new mongoose.Types.ObjectId(userid);
         const fetchUserPayoutInfo = await payoutHistories.find({userid: objectUserId}).sort({ updatedAt: -1 });
 
         if (!fetchUserPayoutInfo) {
             return res.status(400).json({ message: 'No Rewards avaliable' });
         }
 
         res.status(200).json(fetchUserPayoutInfo);
 
        } catch (error) {
             console.error(error);
        } 
     });

    app.post('/addReward', async (req, res) => {
        const userid = '67ef81ffeb0282e51ace21a5';
        const gameId = '67f39a3b4be9c2edce58ed09';
        const gameName = 'Subway Surfers';
        const gameReward = '5000';
        const gamePlayers = '100';
        const gameDateTime = '2025-04-06T12:54:18.081+00:00';
        const gameType = 'reward';

        const objectUserId = new mongoose.Types.ObjectId(userid);
        const objectGameId = new mongoose.Types.ObjectId(gameId);

        const newReward = new redeemRewardHistories({
            userid: objectUserId,
            gameId: objectGameId,
            gameName,
            gameReward,
            gamePlayers,
            gameDateTime,
            gameType
        });

        await newReward.save();
        res.status(200).json({ message: 'success' });
    });

    app.get('/get_bank_info', async (req, res) => {
        try {
            const { userid } = req.query;

            objectUserId = new mongoose.Types.ObjectId(userid);
            const fetchedBankInfo = await bankInfo.find({ userid: objectUserId });
            if (!fetchedBankInfo) {
                 return res.status(400).json({ message: 'No bank Information found' });
            }              
            res.status(200).json(fetchedBankInfo);     
        } catch (error) {
        }
    });

    app.get('/redeem_get_bank_info', async (req, res) => {
        try {
            const { userid, bankCode } = req.query;

            objectUserId = new mongoose.Types.ObjectId(userid);
            const fetchedBankInfo = await bankInfo.findOne({ userid: objectUserId, bankCode: bankCode });
            if (!fetchedBankInfo) {
                 return res.status(400).json({ message: 'No bank Information found' });
            }              
            res.status(200).json(fetchedBankInfo);     
        } catch (error) {
        }
    });

    app.post('/add_bank_info', async (req, res) => {
        const { userid, bankName, bankCode, accountNo, accountName } = req.body;

        objectUserId = new mongoose.Types.ObjectId(userid);

        const checkName = await User.findById(objectUserId);
        if (!checkName) {
            return res.status(400).json({ message: 'Problem Finding User' });
        }

        const userFullName = checkName.firstName + " " + checkName.lastName;

        const apiName = accountName;
        const dbName = userFullName;
    
        // Step 1: Normalize API name parts
        const normalize = (name) => {
            return (name || '') // if name is undefined, fallback to an empty string
                .replace(/,/g, '')
                .toLowerCase()
                .trim()
                .split(/\s+/);
        };

        const apiParts = normalize(apiName); // ['alaoma', 'chibudom', 'michael']
    
        // Step 2: Normalize DB name and extract first and last name
        const dbParts = normalize(dbName);
        const [firstName, lastName] = dbParts;
        console.log(firstName);
        console.log(lastName);
        console.log(dbParts);
        console.log(apiName);
    
        // Step 3: Check if both exist in the API name
        const isMatch = apiParts.includes(firstName) && apiParts.includes(lastName);
    
        if (!isMatch) {
            return res.status(400).json({ message: 'Name does not match ❌' });
        }

        const checkExistingBank = await bankInfo.find({ _id: objectUserId });
        if (checkExistingBank.length == 3) {
            return res.status(400).json({ message: 'Maximum bank account number reached' })
        }

        const checkIfBankexist = await bankInfo.findOne({accountNo: accountNo});

        if (checkIfBankexist) return res.status(400).json({message: 'Bank account already exist'});

            const bankImagesResponse = await fetch('https://nigerianbanks.xyz/');
            
            if (!bankImagesResponse.ok) {
              throw new Error('Failed to fetch bank data');
            }
          
            const result = await bankImagesResponse.json();
          
            // Find bank info by code
            const bankImg = result.find(b => b.code.trim() === String(bankCode).trim());

            const data = {
            type: 'nuban',
            name: `${accountName}`,
            account_number: `${accountNo}`,
            bank_code: `${bankCode}`,
            currency: 'NGN'
            };
    
            axios.post('https://api.paystack.co/transferrecipient', data, {
            headers: {
                Authorization: 'Bearer sk_test_652825ee963d91b1ba2111a48a4384430126d23d',
                'Content-Type': 'application/json'
            }
            })
            .then(response => {
                const responseData = response.data;
                if (responseData.status == true) {
                    const recipient_code = responseData.data.recipient_code;

                    const newBankInfo = new bankInfo({
                        userid: objectUserId,
                        bankName,
                        bankCode,
                        bankImg: bankImg.logo || null,
                        accountNo,
                        accountName,
                        recipientCode: recipient_code
                    });
                    
                    newBankInfo.save();
                }
                console.log(response.data);
            })
            .catch(error => {
                console.error(error.response ? error.response.data : error.message);
            });
                  
        res.status(200).json({ message: 'Bank details added successfully' });

    });

    app.get('/delete_bank', async (req, res) => {
        try {
            const { id } = req.query;

            objectId = new mongoose.Types.ObjectId(id);
            const deleteBank = await bankInfo.findByIdAndDelete(objectId);
            if (!deleteBank) {
                return res.status(400).json({ message: 'Bank does not exist' })
            }
            return res.status(200).json({ message: 'success' });
        } catch (error) {
            
        }
    })

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
