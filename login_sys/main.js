const bcrypt = require('bcrypt');
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const utils = require('../utils/utils.js')
const generatePassword = require('generate-password')
const nodemailer = require('nodemailer');
const secret = require('../secret.json')



passport.use(new LocalStrategy(async (username, password, done) => {
    
    const user = await utils.getUserdata(username)
    if (!user) {
        return done(null, false)
    }
    try {
        if (await bcrypt.compare(password, user.password)) {
            return done(null, user)
        } else {
            console.log("Wrong password.")
            return done(null, false)
        }
    } catch (err) {
        return done(err);
    }

}));


passport.use(new GoogleStrategy({
    clientID: secret.google_ID,
    clientSecret: secret.google_secret,
    callbackURL: 'http://localhost:5000/auth_google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    const password = generatePassword.generate({
        length: 30,
        numbers: true,
        symbols: true,
        uppercase: true,
        excludeSimilarCharacters: true,
    });
    // console.log(profile)
    const user = await utils.getUserdataByEmail(profile._json.email)

    if (user) {
        return done(null, user);
    }
 
    await utils.insertUser('User'+ profile.id, password, profile._json.email)

    const user2 = await utils.getUserdataByEmail(profile._json.email)

    const fullname = profile.displayName
    const [firstName, lastName] = fullname.split(' ');

    await utils.createProfile(firstName.toLowerCase(), lastName.toLowerCase(), user2.id)

    return done(null, user2);
  }));


passport.use(new FacebookStrategy({
    clientID: secret.facebook_ID,
    clientSecret: secret.facebook_secret,
    callbackURL: 'http://localhost:5000/auth_facebook/callback',
    profileFields: ['id', 'displayName', 'photos', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
        const password = generatePassword.generate({
            length: 30,
            numbers: true,
            symbols: true,
            uppercase: true,
            excludeSimilarCharacters: true,
        });

        const user = await utils.getUserdataByEmail(profile._json.email)
    
        if (user) {
            console.log('Already have user.')
            return done(null, user);
        }
     
        await utils.insertUser('User'+ profile.id, password, profile._json.email)
    
        const user2 = await utils.getUserdataByEmail(profile._json.email)
        // console.log(user2)
        const fullname = profile.displayName
        const [firstName, lastName] = fullname.split(' ');

        await utils.createProfile(firstName.toLowerCase(), lastName.toLowerCase(), user2.id)
        
        return done(null, user2);
    }
))

passport.serializeUser((user, done) => {
    const sessionUser = {
        id: user.id,
        username: user.username,
        customData: 'This is some custom data'
    };
    done(null, sessionUser);
});

passport.deserializeUser(async (sessionUser, done) => {
    try {
        const data = await utils.getUserdataByid(sessionUser.id)
        return done(null, data)
        } catch (err) {
        return done(err);
    }
});

function authenticatedUser(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err); 
        }
        if (!user) {
            return res.redirect('/login'); 
        }
        req.logIn(user, function(err) {
            if (err) {
                return next(err);  
            }
            return res.redirect(`/profile/${req.body.username}`); 
        });
    })(req, res, next);
}


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    } else {
        res.redirect('/login');
    }
}



async function register (username, password) {
    const checker = await utils.getUserdata(username)

    if (checker) {
        console.log('User already exist.')
        return false
    }


    const salt = await bcrypt.genSalt(10);
    const hash_pass = await bcrypt.hash(password, salt);
    await utils.insertUser(username, hash_pass, 'bruh')


    const user = await utils.getUserdata(username)
    await utils.createProfile(null, null, user.id)

    console.log('Successful register.')
    return true

}

const sendOtpEmail = (user, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'pumasinp@gmail.com',
            pass: 'aqazmvovsacnoppf', // Your app password
        },
    });
  
    const mailOptions = {
      from: 'pumasinp@gmail.com',
      to: user,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  };

function profile_redirect (req, res) {
    res.redirect(`/profile/${req.user.username}`); // Redirect to profile after successful authentication
}

const google_auth = passport.authenticate('google', { scope: ['profile', 'email'] })

const google_callback = passport.authenticate('google', { failureRedirect: '/fail' })

const facebook_auth = passport.authenticate('facebook', { scope: ['public_profile', 'email']})

const facebook_callback = passport.authenticate('facebook', { failureRedirect: '/fail' })

module.exports = {
    ensureAuthenticated,
    register,
    authenticatedUser,
    sendOtpEmail,
    profile_redirect,
    google_auth,
    google_callback,
    facebook_auth,
    facebook_callback
}

