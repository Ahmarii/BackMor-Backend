const express = require('express');
const utils = require('../utils/utils.js');
const { ensureAuthenticated, register, authenticatedUser } = require('../login_sys/main.js');
const { db, closedb } = require('../database/db_main.js');
const path = require('path')
const fs = require('fs')

const router = express.Router();

router.get('/', (req, res) => {
    res.send('cpre888 บิดแล้วรวยซวยแล้วมึง');
});

router.get('/profile/:name', ensureAuthenticated, async (req, res) => {
    const data = await utils.getCustomerDataByName(req.user.username)
    const img = await utils.getProfileImage(req.user.id) ?? path.join(__dirname, '..', '/scr', 'josukarn.png')

    const imgData = img.data;
    console.log(imgData)
    
    res.send(imgData)

    const firstname = data.firstname;
    const lastname = data.lastname;

    if (req.params.name == req.user.username) {
        res.render('profile', { firstname, lastname, imgData });
    } else {
        res.render('other_profile', { firstname, lastname, imgData })
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



// Img upload test.



const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, '..', '/scr', 'uploads/') }); 


router.post('/upload', upload.single('image'), async (req, res) => {
    console.log('naheeee')
    console.log(req.file)
    try {

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Read the file content
        const fileContent = await fs.promises.readFile(req.file.path);

        // Insert into PostgreSQL
        const result = await utils.uploadProfileImage(req.file.originalname, req.file.mimetype, fileContent, req.user.id);


        res.json({ message: 'File uploaded successfully', id: result.rows[0].images_id });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Error uploading file' });
    }
});


module.exports = router;