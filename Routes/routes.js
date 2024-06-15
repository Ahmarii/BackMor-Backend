const express = require('express');
const utils = require('../utils/utils.js');
const { ensureAuthenticated, register, authenticatedUser } = require('../login_sys/main.js');
const { db, closedb } = require('../database/db_main.js');
const path = require('path')
const fs = require('fs')

const router = express.Router();


router.use('/public', express.static(path.join(__dirname, 'public')));

router.get('/', (req, res) => {
    res.send('cpre888 บิดแล้วรวยซวยแล้วมึง');
});

router.get('/profile/:name', ensureAuthenticated, async (req, res) => {
    const data = await utils.getCustomerDataByName(req.user.username)
    const firstname = data.firstname;
    const lastname = data.lastname;

    const img = await utils.getProfileImage(req.user.id)
    const img2 = './public/' + img.image_name

    
    const imagePath = path.join(__dirname, '../public/', img.image_name);


    if (req.params.name == req.user.username) {
        res.render('profile', { firstname, lastname, imagePath });
    } else {
        res.render('other_profile', { firstname, lastname, imagePath })
    }


});

router.get('/image/:id', async (req, res) => {
    const img = await utils.getProfileImage(req.params.id)
    console.log(img)
    res.end(img.img)
})

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



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public');
    },
    filename: function (req, file, cb) {
      const username = req.user.username; // assuming username is sent in the body
      const timestamp = Date.now();
      const extension = path.extname(file.originalname);
      cb(null, `${timestamp}_${username}${extension}`);
    }
  });
  
  const upload = multer({ storage: storage });
  
  router.post('/upload', upload.single('image'), async (req, res) => {
    try {

        utils.uploadProfileImage(req.file.filename, req.user.id)

        console.log(req.file);
        res.status(200).send('File uploaded successfully');
    } catch (error) {
        res.status(500).send('Error uploading file');
    }
  });


module.exports = router;