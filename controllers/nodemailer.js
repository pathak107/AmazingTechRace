const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    secure: false,
    port: 587,
    auth: {
      user: "contactus@istemanipal.com",
      pass: "Zprd6DxMPdRJ",
    },
  });

module.exports=transporter;