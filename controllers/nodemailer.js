const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    secure: false,
    port: 587,
    auth: {
      user: process.env.ZOHO_USER,
      pass: process.env.ZOHO_PASS,
    },
  });

module.exports=transporter;