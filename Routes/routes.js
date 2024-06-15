const express = require('express');
const utils = require('../utils/utils.js');
const { ensureAuthenticated, register, authenticatedUser } = require('../login_sys/main.js');

const router = express.Router();

router.get('/', (req, res) => {
    res.send('cpre888 บิดแล้วรวยซวยแล้วมึง');
});

router.get('/profile/:name', ensureAuthenticated, async (req, res) => {
    const data = await utils.getCustomerDataByName(req.user.username)
    const firstname = data.firstname;
    const lastname = data.lastname;

    if (req.params.name == req.user.username) {
        res.render('profile', { firstname, lastname });
    } else {
        res.render('other_profile', { firstname, lastname })
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

module.exports = router;