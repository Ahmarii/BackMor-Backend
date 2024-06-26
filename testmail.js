const nodemailer = require('nodemailer');

const sendOtpEmail = () => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'pumasinp@gmail.com',
            pass: 'aqazmvovsacnoppf', // Your app password
        },
    });

    const mailOptions = {
        from: 'pumasinp@gmail.com',
        to: 'karnssk123@gmail.com',
        subject: 'มือปราบ',
        text: `หี`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

for (let i = 0; i < 5; i++) {
    console.log(i)
    sendOtpEmail()
}
