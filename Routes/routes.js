const express = require('express');
const utils = require('../utils/utils.js');
const { ensureAuthenticated, register, authenticatedUser } = require('../login_sys/main.js');
const { db, closedb } = require('../database/db_main.js');
const path = require('path')
const fs = require('fs')
const bcrypt = require('bcrypt')

const router = express.Router();



router.get('/image/:name', async (req, res) => {
    const img = await utils.getProfileImageByName(req.params.name)
    if (!img) {
        res.sendFile(path.join(__dirname, `../public/default.jpg`))
    } else {
        res.sendFile(path.join(__dirname, `../public/${img.images_name}`))
    }

})

router.get('/', (req, res) => {
    res.send('cpre888 บิดแล้วรวยซวยแล้วมึง');
});

router.get('/profile/:name', ensureAuthenticated, async (req, res) => {
    const data = await utils.getCustomerDataByName(req.params.name)

    // console.log(data)
    const firstname = data.firstname;
    const lastname = data.lastname;

    const name = req.params.name


    if (req.params.name == req.user.username) {
        res.render('profile', { firstname, lastname, name });
    } else {
        res.render('other_profile', { firstname, lastname, name })
    }


});



router.post('/profile', async (req, res) => {
    const formdata = req.body;
    try {
        await utils.updateData(formdata, req.user.id);
        res.status(200).json({ redirect: `/profile/${req.user.username}` });
    } catch (error) {
        console.error('Error updating data:', error);
        res.status(500).send('Internal Server Error');
    }
});



router.get('/register', (req, res) => {
    const prompt = 'register';
    const command = 'submit';
    const button = 'submit';
    res.render('login_regis', { prompt, command, button });
});

router.get('/login', (req, res) => {
    const prompt = 'login';
    const command = 'login';
    const button = 'login';
    res.render('login_regis', { prompt, command, button });
});

router.post('/submit', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;


    const succesOrNot = await register(username, password);

    if (!succesOrNot) {
        res.redirect('/register')
        return
    }

    res.redirect('/login');
});

router.post('/login', authenticatedUser);

  
  router.post('/upload', utils.upload.single('image'), async (req, res) => {
    try {

        utils.uploadProfileImage(req.file.filename, req.user.id)

        // console.log(req.file);
        console.log('File uploaded successfully')
        res.redirect(`/profile/${req.user.username}`)

    } catch (error) {
        res.status(500).send('Error uploading file');
    }
  });


module.exports = router;