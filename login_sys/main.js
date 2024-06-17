const bcrypt = require('bcrypt');
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const utils = require('../utils/utils.js')
const generatePassword = require('generate-password')


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
    clientID: process.env.google_ID,
    clientSecret: process.env.google_secret,
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
    // console.log(profile._json.email)
    const user = await utils.getUserdataByEmail(profile._json.email)

    if (user) {
        return done(null, user);
    }
 
    await utils.insertUser(profile.id, password, profile._json.email)

    const user2 = await utils.getUserdataByEmail(profile._json.email)
    // console.log(user2)
    await utils.createProfile(user2.id)

    return done(null, user);
  }));

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
    await utils.createProfile(user.id)

    console.log('Successful register.')
    return true

}



module.exports = {
    ensureAuthenticated,
    register,
    authenticatedUser
}

