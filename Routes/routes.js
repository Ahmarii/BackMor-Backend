const express = require('express');
const utils = require('../utils/utils.js');
const { ensureAuthenticated, 
    register, 
    authenticatedUser, 
    sendOtpEmail, 
    profile_redirect, 
    google_auth, 
    google_callback,
    facebook_auth,
    facebook_callback
} = require('../login_sys/main.js');

const {
    sendImage,
    renderProfile,
    profileUpdate,
    renderRegister,
    renderLogin,
    loginSubmit,
    renderOtpverify,
    otpVerify,
    renderFailLogin,
    imageUpload,
    UploadProfileImg,
    logout,
    searchUser,
    createEvent,
    friend,
    add_friend
} = require('../controller/main_control.js')


const router = express.Router();

router.get('/', (req, res) => {
    res.send('cpre888 บิดแล้วรวยซวยแล้วมึง');
});

router.get('/image/:name', sendImage)

router.get('/profile/:name', ensureAuthenticated, renderProfile);

router.post('/profile', profileUpdate );

router.get('/register', renderRegister);

router.get('/login', renderLogin);

router.post('/submit', loginSubmit );

router.get('/register/verify', renderOtpverify )

router.post('/verify-otp', otpVerify );

router.get('/fail', renderFailLogin )

router.post('/login', authenticatedUser);

router.post('/auth_google', google_auth)

router.get('/auth_google/callback', google_callback, profile_redirect);

router.post('/auth_facebook', facebook_auth)

router.get('/auth_facebook/callback', facebook_callback, profile_redirect);

router.post('/upload', imageUpload , UploadProfileImg );

router.get('/logout', logout );

router.post('/userSearch', searchUser )

router.post('/createEvent', createEvent )

router.get('/friend', ensureAuthenticated, friend )

router.post('/add_friend', add_friend )

module.exports = router;