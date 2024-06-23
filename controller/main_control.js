const { unwatchFile } = require('fs');
const utils = require('../utils/utils.js');
const otpGenerator = require('otp-generator');
const path = require('path')


async function sendImage (req, res) {
    // console.log('img api is called')
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
    try {
        firstname = data.firstname;
        lastname = data.lastname;
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }


    const imgName = req.params.name
    if (req.params.name == req.user.username) {
        const user_data = await utils.getUserdataByid(req.user.id)
        const username = user_data.username
        console.log('render Profile')
        res.render('profile', { firstname, lastname, imgName, username });
    } else {
        const username = req.params.name
        const friend_data = await utils.getUserdata(username)
        const friendId = friend_data.id
        const checker = await utils.checkFriendReq(req.user.id, friendId)
        const friendCheck = await utils.checkFriendList(req.user.id, friendId)

        if (friendCheck) {
            addFriendButton = 'Remove friend'
        } else if (checker) {
            addFriendButton = 'Undo request'
        } else {
            addFriendButton = 'Add friend'
        }
        console.log(addFriendButton)
        console.log('render other Profile')
        res.render('other_profile', { firstname, lastname, imgName, username, addFriendButton })
    }

}

async function searchUser (req, res) {
    const username = await req.body.query
    const usernameList = await utils.searchUsername(username)
    const usernames = usernameList.map(result => result.username);
    res.json(usernames)
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

async function createEvent (req, res) {
    res.send('pap')
}

async function add_friend (req, res) {
    console.log('add friend press')
    const friend_username = await req.body
    const friendId = await utils.getUserdata(friend_username.username)
    utils.addFriend(req.user.id, friendId.id)

}

async function friendRequestList(req, res) {
    const friendReqedList = await utils.getFriendReqedList(req.user.id)
    res.json(friendReqedList)
}

//friend requested list
async function friendReqList(req, res) {
    const friendReqList = await utils.getFriendReqList(req.user.id)
    res.json(friendReqList)
}

async function cancelFriendReq(req, res) {
    const username = req.body.username
    await utils.cancelFriendReq(req.user.id, username)
    res.send({ status: 'ok' });
}

async function friendPage (req, res) {
    res.render('friendPage')
}

async function friendRequested (req, res) {
    res.render('friendRequested')
}

function friendRequest (req, res) {
    res.render('friendRequest')
}

async function denyFriendReq (req, res) {
    const username = req.body.username
    await utils.denyFriendReq(req.user.id, username)
    res.send({ status: 'ok' });
}

async function acceptFriendReq (req, res) {
    const username = req.body.username
    await utils.acceptFriendReq(req.user.id, username)
    res.send({ status: 'ok' });
}

async function removeFriend (req, res) {
    const friendUsername = await req.body.username
    await utils.removeFriend(req.user.id, friendUsername) 
}

async function getFriendList (req, res) {
    console.log('getting friend list')
    const friendList = await utils.getFriendList(req.user.id)
    res.json(friendList)
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
    logout,
    searchUser,
    createEvent,
    add_friend,
    friendRequest,
    cancelFriendReq,
    friendPage,
    friendRequestList,
    friendRequested,
    friendReqList,
    acceptFriendReq,
    denyFriendReq,
    removeFriend,
    getFriendList
}