const utils = require('../utils/utils.js');
const otpGenerator = require('otp-generator');
const path = require('path')


async function sendImage (req, res) {
    const img = await utils.getProfileImageByName(req.params.name)
    if (!img) {
        res.sendFile(path.join(__dirname, `../public/default.jpg`))
    } else {
        res.sendFile(path.join(__dirname, `../public/${img.images_name}`))
    }

}

async function renderProfile (req, res) {
    const data = await utils.getCustomerDataByUsername(req.params.name)

    // console.log(data)
    const firstname = data.firstname;
    const lastname = data.lastname;

    const name = req.params.name


    if (req.params.name == req.user.username) {
        const user_data = await utils.getUserdataByid(req.user.id)
        const username = user_data.username
        res.render('profile', { firstname, lastname, name, username });
    } else {
        res.render('other_profile', { firstname, lastname, name })
    }

}


async function profileUpdate (req, res) {
    const formdata = req.body;
    try {
        await utils.updateUsername(formdata, req.user.id);

        req.user.username = formdata.username;

        await utils.updateData(formdata, req.user.id);
        res.status(200).json({ redirect: `/profile/${req.user.username}` });
    } catch (error) {
        console.error('Error updating data:', error);
        res.status(500).send('Internal Server Error');
    }
}

function renderRegister (req, res) {
    const prompt = 'register';
    const command = 'submit';
    const button = 'submit';
    res.render('login_regis', { prompt, command, button });
}

function renderLogin (req, res) {
    const prompt = 'login';
    const command = 'login';
    const button = 'login';
    res.render('login_regis', { prompt, command, button });
}

async function loginSubmit (req, res) {
    req.session.email = req.body.username
    req.session.password = req.body.password

    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
    req.session.otp = otp;
    console.log(otp)

    sendOtpEmail(req.body.username, otp);
    res.redirect('/register/verify')

}

function renderOtpverify (req, res) {
    res.render('otp_verify')
}

async function otpVerify (req, res) {
    const otp = await req.body.otp;
    
    if (req.session.otp == otp) {
      res.redirect('/login');
    } else {
      res.send('Invalid OTP.');
    }
}

function renderFailLogin (req, res) {
    res.send('login failed.')
}

const imageUpload  = utils.upload.single('image')

async function UploadProfileImg (req, res) {
    try {
    
        utils.uploadProfileImage(req.file.filename, req.user.id)
    
        // console.log(req.file);
        console.log('File uploaded successfully')
        res.redirect(`/profile/${req.user.username}`)
    
    } catch (error) {
        res.status(500).send('Error uploading file');
    }
}

function logout (req, res) {
    req.logout((err) => {
      if (err) { return next(err); }
      res.redirect('/login');
    });
}

module.exports = {
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
    logout
}