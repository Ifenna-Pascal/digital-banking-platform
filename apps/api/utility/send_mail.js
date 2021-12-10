const SIB = process.env.SIB_API_KEY;
const sibv3 = require('sib-api-v3-sdk');
const nodemailer = require('nodemailer');

function send_mail() {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // no need to set host or port etc.
            auth: {
                user: 'ifennamonanu70@gmail.com',
                pass: 'Pascalisreal@2002',
            },
        });
        transporter.sendMail({
            to: 'pascalmonanu@gmail.com',
            from: 'ifennamonanu70@gmail.com',
            subject: 'Signup verification',
            html: '<h1>Please verify your email</h1><a href="www.google.com"> <button>Verify</button>',
        });
    } catch (error) {
        console.log(error);
    }
}

console.log(send_mail());
